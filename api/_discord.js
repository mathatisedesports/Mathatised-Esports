/* =============================================================================
   Mathatised Esports assistant: Discord commands (logic)
   The web endpoint is api/discord.mjs; the answering is api/_assistant.js;
   strikes and blocks are api/_moderation.js.

   Commands:
     /ask           everyone (only in the channels you allow in Discord)
     /bot-block     staff: block someone from the assistant for a while
     /bot-unblock   staff: lift a block early and clear their strikes
     /bot-strikes   staff: see someone's strikes and block
   Staff = members with Discord's "Timeout Members" permission (admins always).

   Vercel environment variables:
     DISCORD_APPLICATION_ID, DISCORD_PUBLIC_KEY, DISCORD_BOT_TOKEN
============================================================================= */
"use strict";

const assistant = require("./_assistant.js");
const mod = require("./_moderation.js");

const DISCORD_API = "https://discord.com/api/v10";
const SITE_URL = assistant.SITE_URL;
const RULEBOOK = SITE_URL + "/assets/docs/mecs-rules-and-regulations.pdf";
const tooFast = assistant.makeLimiter(4, 40); /* per Discord user: per minute, per day */
const lastSpamStrike = new Map();            /* at most one spam strike per 10 minutes */
const STAFF_PERMISSION = String(1n << 40n);  /* "Timeout Members" */

const USER_OPTION = { type: 6, name: "user", description: "The member", required: true };
const COMMANDS = [
  {
    name: "ask", type: 1,
    description: "Ask the Mathatised Esports assistant about MECS, rules, schedules and more",
    options: [{ type: 3, name: "question", description: "Your question", required: true, max_length: 500 }],
    contexts: [0], integration_types: [0]
  },
  {
    name: "bot-block", type: 1,
    description: "Staff: block a member from the assistant for a while",
    options: [
      USER_OPTION,
      { type: 3, name: "time", description: "How long", required: true, choices: [
        { name: "30 minutes", value: "30m" }, { name: "1 hour", value: "1h" }, { name: "6 hours", value: "6h" },
        { name: "1 day", value: "1d" }, { name: "3 days", value: "3d" }, { name: "7 days", value: "7d" }, { name: "30 days", value: "30d" }
      ] },
      { type: 3, name: "reason", description: "Optional note for the bot-log", required: false, max_length: 200 }
    ],
    default_member_permissions: STAFF_PERMISSION, contexts: [0], integration_types: [0]
  },
  {
    name: "bot-unblock", type: 1,
    description: "Staff: let a member use the assistant again and clear their strikes",
    options: [USER_OPTION],
    default_member_permissions: STAFF_PERMISSION, contexts: [0], integration_types: [0]
  },
  {
    name: "bot-strikes", type: 1,
    description: "Staff: see a member's assistant strikes and block",
    options: [USER_OPTION],
    default_member_permissions: STAFF_PERMISSION, contexts: [0], integration_types: [0]
  }
];

const BUSY = "I'm getting a lot of questions right now, so I can't answer this one. Please try again in a few minutes, check the latest announcements, or open a support ticket.";
const UNAVAILABLE = "I can't answer right now. Please check the latest announcements or the rulebook (" + RULEBOOK + "), or open a support ticket.";

/* ---------------------------------------------------------------------------
   Request signature check (Discord requires this)
--------------------------------------------------------------------------- */
function hexToBytes(hex) {
  if (typeof hex !== "string" || !/^[0-9a-f]*$/i.test(hex) || hex.length % 2) return new Uint8Array(0);
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}

async function verifySignature(rawBody, signatureHex, timestamp, publicKeyHex) {
  const sig = hexToBytes(signatureHex || "");
  const pub = hexToBytes(String(publicKeyHex || "").trim());
  if (sig.length !== 64 || pub.length !== 32 || !timestamp) return false;
  const data = new TextEncoder().encode(timestamp + rawBody);
  try {
    const subtle = globalThis.crypto && globalThis.crypto.subtle;
    const key = await subtle.importKey("raw", pub, { name: "Ed25519" }, false, ["verify"]);
    return await subtle.verify({ name: "Ed25519" }, key, sig, data);
  } catch (e) {
    /* Fallback for Node versions without Ed25519 in WebCrypto */
    try {
      const nodeCrypto = require("crypto");
      const key = nodeCrypto.createPublicKey({
        key: Buffer.concat([Buffer.from("302a300506032b6570032100", "hex"), Buffer.from(pub)]),
        format: "der", type: "spki"
      });
      return nodeCrypto.verify(null, Buffer.from(data), key, Buffer.from(sig));
    } catch (e2) {
      return false;
    }
  }
}

/* ---------------------------------------------------------------------------
   Reply formatting
--------------------------------------------------------------------------- */
const SITE_PATHS = /(^|[\s(])\/(mecs-middle-east|mecs-apac|mecs|spl|competitions|contact|join-us|team|who-we-are|host-your-event|sponsor|assets\/docs\/[\w.-]+)(?=[\s).,!?:;]|$)/g;

function toDiscordMarkdown(text) {
  return String(text)
    .replace(/\]\((\/[^)\s]*)\)/g, (m, p) => "](" + SITE_URL + p + ")")   /* [text](/page) -> full link */
    .replace(SITE_PATHS, (m, before, p) => before + SITE_URL + "/" + p)   /* bare /page -> full link */
    .replace(/^\s*#{1,6}\s+(.*)$/gm, "**$1**")                             /* no big headings */
    .replace(/@(everyone|here)/g, "@​$1");
}

function quoteQuestion(q) {
  return "> " + String(q).replace(/\s+/g, " ").trim().slice(0, 300)
    .replace(/\]\(/g, "] (")              /* no disguised links in the echoed question */
    .replace(/@(everyone|here)/g, "@​$1");
}

function buildReply(question, answerText) {
  let content = quoteQuestion(question) + "\n\n" + toDiscordMarkdown(answerText);
  if (content.length > 1950) content = content.slice(0, 1850).replace(/\s+\S*$/, "") + " …\n\nFull details: " + RULEBOOK;
  return content;
}

/* ---------------------------------------------------------------------------
   Talking back to Discord
--------------------------------------------------------------------------- */
function webhook(i, suffix) { return DISCORD_API + "/webhooks/" + i.application_id + "/" + i.token + suffix; }

async function call(url, method, body) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) console.error("[discord]", method, url.replace(/\/webhooks\/\d+\/[^/]+/, "/webhooks/…"), res.status, await res.text().catch(() => ""));
  return res.ok;
}
const editOriginal = (i, data) => call(webhook(i, "/messages/@original"), "PATCH", Object.assign({ allowed_mentions: { parse: [] } }, data));
const deleteOriginal = (i) => call(webhook(i, "/messages/@original"), "DELETE");
const privateFollowup = (i, content) => call(webhook(i, ""), "POST", { content, flags: 64, allowed_mentions: { parse: [] } });

function privateMessage(content) {
  return { status: 200, body: { type: 4, data: { content, flags: 64, allowed_mentions: { parse: [] } } } };
}
const THINKING_PUBLIC = { status: 200, body: { type: 5 } };
const THINKING_PRIVATE = { status: 200, body: { type: 5, data: { flags: 64 } } };

function optionValue(i, name) {
  const o = ((i.data && i.data.options) || []).find((x) => x.name === name);
  return o ? o.value : undefined;
}

function later(opts, work) {
  const p = work().catch((e) => console.error("[discord] task failed", e));
  if (typeof opts.waitUntil === "function") opts.waitUntil(p);
  return p;
}

/* ---------------------------------------------------------------------------
   /ask
--------------------------------------------------------------------------- */
async function handleAsk(i, opts) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const question = String(optionValue(i, "question") || "").trim().slice(0, 500);
  const userId = (i.member && i.member.user && i.member.user.id) || (i.user && i.user.id) || "unknown";
  if (!question) return privateMessage("Type your question after `/ask`, for example: `/ask When does MECS APAC start?`");

  /* 1. Blocked? (records are cached for 20 seconds; if the log can't be read, let them through) */
  try {
    const records = await Promise.race([mod.readRecords(token), new Promise((r, x) => setTimeout(() => x(new Error("slow")), 1500))]);
    const s = mod.stateFor(records, userId);
    if (s.blockedUntil) return privateMessage("⛔ You can't use the assistant right now. You can ask again <t:" + Math.floor(s.blockedUntil / 1000) + ":R>.");
  } catch (e) { console.warn("[discord] block check skipped:", e.message); }

  /* 2. Spamming? First time in 10 minutes it counts as a strike */
  if (tooFast(userId)) {
    const last = lastSpamStrike.get(userId) || 0;
    if (Date.now() - last < 10 * 60 * 1000) return privateMessage("You're asking too quickly. Please wait a minute.");
    lastSpamStrike.set(userId, Date.now());
    later(opts, async () => {
      const s = await mod.addStrike(token, userId, "too many questions too quickly", "", "spam");
      await editOriginal(i, { content: s.message });
    });
    return THINKING_PRIVATE;
  }

  /* 3. Answer. Public "thinking…" first; off-topic/abusive questions are removed and answered privately */
  later(opts, async () => {
    const r = await assistant.answer([{ role: "user", parts: [{ text: question }] }], "discord");
    if (r.ok && r.refused) {
      await deleteOriginal(i);
      const s = await mod.addStrike(token, userId, "off-topic or abusive question", question);
      await privateFollowup(i, s.message);
      return;
    }
    const text = r.ok ? r.text : r.error === "busy" ? BUSY : UNAVAILABLE;
    await editOriginal(i, { content: buildReply(question, text), flags: 4 /* no link previews */ });
  });
  return THINKING_PUBLIC;
}

/* ---------------------------------------------------------------------------
   Staff commands (Discord only shows them to members with "Timeout Members")
--------------------------------------------------------------------------- */
async function handleStaff(i, opts) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!mod.logChannelId()) return privateMessage("The bot-log channel isn't set up yet (api/knowledge/discord.json).");
  const staffId = (i.member && i.member.user && i.member.user.id) || "staff";
  const target = String(optionValue(i, "user") || "");
  if (!/^\d+$/.test(target)) return privateMessage("Pick a member.");
  const targetUser = i.data.resolved && i.data.resolved.users && i.data.resolved.users[target];
  if (targetUser && targetUser.bot) return privateMessage("That's a bot, not a member.");
  const name = i.data.name;

  later(opts, async () => {
    const now = Date.now();
    if (name === "bot-block") {
      const ms = mod.parseDuration(optionValue(i, "time"));
      if (!ms) return editOriginal(i, { content: "I didn't understand that length of time." });
      const reason = String(optionValue(i, "reason") || "").trim();
      const until = now + ms;
      const ok = await mod.writeRecord(token, { type: "block", user: target, at: now, until, by: staffId },
        "⛔ <@" + staffId + "> blocked <@" + target + "> from the assistant for **" + mod.formatDuration(ms) + "**, until <t:" + Math.floor(until / 1000) + ":f>" + (reason ? "\nReason: " + reason.replace(/@(everyone|here)/g, "@​$1") : ""), mod.COLORS.block);
      return editOriginal(i, { content: ok ? "Done. <@" + target + "> can't use the assistant for " + mod.formatDuration(ms) + " (until <t:" + Math.floor(until / 1000) + ":f>)." : "I couldn't write to the bot-log channel. Check the bot can see it and send messages there." });
    }
    if (name === "bot-unblock") {
      const ok = await mod.writeRecord(token, { type: "unblock", user: target, at: now, until: 0, by: staffId },
        "✅ <@" + staffId + "> unblocked <@" + target + "> and cleared their strikes", mod.COLORS.unblock);
      return editOriginal(i, { content: ok ? "Done. <@" + target + "> can use the assistant again, and their strikes are cleared." : "I couldn't write to the bot-log channel. Check the bot can see it and send messages there." });
    }
    if (name === "bot-strikes") {
      let s;
      try { s = mod.stateFor(await mod.readRecords(token, true), target); } catch (e) { return editOriginal(i, { content: "I couldn't read the bot-log channel. Check the bot can see it." }); }
      const lines = ["<@" + target + ">: **" + s.strikes + "** strike" + (s.strikes === 1 ? "" : "s") + " in the last 7 days."];
      lines.push(s.blockedUntil ? "⛔ Blocked until <t:" + Math.floor(s.blockedUntil / 1000) + ":f> (<t:" + Math.floor(s.blockedUntil / 1000) + ":R>)." : "Not blocked.");
      const next = mod.penaltyFor(s.strikes + 1);
      lines.push("Next strike: " + (next ? "blocked for " + mod.formatDuration(next) : "a warning") + ".");
      return editOriginal(i, { content: lines.join("\n") });
    }
  });
  return THINKING_PRIVATE;
}

/* ---------------------------------------------------------------------------
   Entry point
--------------------------------------------------------------------------- */
async function handleInteraction(opts) {
  const ok = await verifySignature(opts.rawBody, opts.signature, opts.timestamp, process.env.DISCORD_PUBLIC_KEY);
  if (!ok) return { status: 401, body: { error: "invalid request signature" } };

  let i;
  try { i = JSON.parse(opts.rawBody); } catch (e) { return { status: 400, body: { error: "bad json" } }; }

  if (i.type === 1) return { status: 200, body: { type: 1 } }; /* PING from Discord */
  if (i.type === 2 && i.data) {
    if (i.data.name === "ask") return handleAsk(i, opts);
    if (i.data.name === "bot-block" || i.data.name === "bot-unblock" || i.data.name === "bot-strikes") return handleStaff(i, opts);
  }
  return privateMessage("I don't know that command. Try `/ask`.");
}

/* ---------------------------------------------------------------------------
   One-time setup: registers the commands and checks everything is connected
   (open https://<site>/api/discord?setup in a browser)
--------------------------------------------------------------------------- */
let lastSetup = 0;
async function setup() {
  const lines = ["Mathatised Esports Discord bot: setup check", ""];
  const appId = process.env.DISCORD_APPLICATION_ID, token = process.env.DISCORD_BOT_TOKEN;
  lines.push((appId ? "OK  " : "MISSING  ") + "DISCORD_APPLICATION_ID");
  lines.push((process.env.DISCORD_PUBLIC_KEY ? "OK  " : "MISSING  ") + "DISCORD_PUBLIC_KEY");
  lines.push((token ? "OK  " : "MISSING  ") + "DISCORD_BOT_TOKEN");
  lines.push((process.env.GEMINI_API_KEY ? "OK  " : "MISSING  ") + "GEMINI_API_KEY");
  lines.push("");
  if (!appId || !token) { lines.push("Add the missing values in Vercel (Settings > Environment Variables), redeploy, then open this page again."); return lines.join("\n"); }
  if (Date.now() - lastSetup < 30 * 1000) { lines.push("Setup ran a moment ago. Wait 30 seconds and refresh."); return lines.join("\n"); }
  lastSetup = Date.now();
  const auth = { Authorization: "Bot " + token, "Content-Type": "application/json" };

  try {
    const res = await fetch(DISCORD_API + "/applications/" + appId + "/commands", { method: "PUT", headers: auth, body: JSON.stringify(COMMANDS) });
    lines.push(res.ok
      ? "OK  Commands registered: /ask, /bot-block, /bot-unblock, /bot-strikes"
      : "PROBLEM  Discord refused the commands (" + res.status + "). Check the Application ID and Bot Token.");
  } catch (e) {
    lines.push("PROBLEM  Could not reach Discord: " + e.message);
  }

  const fs = require("fs"), path = require("path");
  let channels = [];
  try { channels = JSON.parse(fs.readFileSync(path.join(__dirname, "knowledge", "discord.json"), "utf8")).channels || []; } catch (e) {}
  lines.push("", "Announcement channels:");
  if (!channels.length) lines.push("  none set yet (api/knowledge/discord.json).");
  for (const c of channels) {
    try {
      const res = await fetch(DISCORD_API + "/channels/" + c.id + "/messages?limit=5", { headers: auth });
      if (!res.ok) { lines.push("PROBLEM  #" + (c.name || c.id) + ": the bot can't read this channel (" + res.status + "). Give the bot View Channel + Read Message History there."); continue; }
      const msgs = await res.json();
      const withText = msgs.filter((m) => m.content || (m.embeds && m.embeds.length)).length;
      lines.push((msgs.length && !withText ? "PROBLEM  #" : "OK  #") + (c.name || c.id) + ": can read it" +
        (msgs.length && !withText ? ", but the messages look empty. Turn on 'Message Content Intent' (Developer Portal > Bot)." : ""));
    } catch (e) {
      lines.push("PROBLEM  #" + (c.name || c.id) + ": " + e.message);
    }
  }

  const log = mod.logChannelId();
  lines.push("", "Staff log channel:");
  if (!log) lines.push("  not set (logChannel in api/knowledge/discord.json).");
  else {
    try {
      const read = await fetch(DISCORD_API + "/channels/" + log + "/messages?limit=1", { headers: auth });
      if (!read.ok) lines.push("PROBLEM  bot-log: the bot can't read it (" + read.status + "). Give the bot View Channel + Read Message History + Send Messages + Embed Links there.");
      else {
        const write = await fetch(DISCORD_API + "/channels/" + log + "/messages", { method: "POST", headers: auth, body: JSON.stringify({ content: "✅ Setup check: the assistant can read and write in this channel. Strikes, blocks and unblocks will be recorded here.", allowed_mentions: { parse: [] } }) });
        lines.push(write.ok ? "OK  bot-log: can read and write (a test message was posted there)" : "PROBLEM  bot-log: the bot can read it but can't post (" + write.status + "). Allow Send Messages + Embed Links there.");
      }
    } catch (e) {
      lines.push("PROBLEM  bot-log: " + e.message);
    }
  }

  lines.push("", "If everything says OK, the bot is ready. New commands can take a minute to appear (restart Discord if they don't).");
  return lines.join("\n");
}

module.exports = { handleInteraction, setup, verifySignature, buildReply, toDiscordMarkdown, COMMANDS };
