/* =============================================================================
   Mathatised Esports assistant: Discord /ask command (logic)
   The web endpoint is api/discord.mjs; the answering is api/_assistant.js.

   Vercel environment variables:
     DISCORD_APPLICATION_ID, DISCORD_PUBLIC_KEY, DISCORD_BOT_TOKEN
============================================================================= */
"use strict";

const assistant = require("./_assistant.js");

const DISCORD_API = "https://discord.com/api/v10";
const SITE_URL = assistant.SITE_URL;
const RULEBOOK = SITE_URL + "/assets/docs/mecs-rules-and-regulations.pdf";
const limited = assistant.makeLimiter(4, 40); /* per Discord user: per minute, per day */

const ASK_COMMAND = {
  name: "ask",
  type: 1,
  description: "Ask the Mathatised Esports assistant about MECS, rules, schedules and more",
  options: [{ type: 3, name: "question", description: "Your question", required: true, max_length: 500 }],
  contexts: [0],          /* servers only */
  integration_types: [0]  /* installed to a server */
};

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

async function editOriginal(appId, token, content) {
  const res = await fetch(DISCORD_API + "/webhooks/" + appId + "/" + token + "/messages/@original", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, allowed_mentions: { parse: [] }, flags: 4 /* no link previews */ })
  });
  if (!res.ok) console.error("[discord] could not post the answer", res.status, await res.text().catch(() => ""));
}

/* ---------------------------------------------------------------------------
   Interactions
--------------------------------------------------------------------------- */
function privateMessage(content) {
  return { status: 200, body: { type: 4, data: { content, flags: 64, allowed_mentions: { parse: [] } } } };
}

async function handleInteraction(opts) {
  const ok = await verifySignature(opts.rawBody, opts.signature, opts.timestamp, process.env.DISCORD_PUBLIC_KEY);
  if (!ok) return { status: 401, body: { error: "invalid request signature" } };

  let i;
  try { i = JSON.parse(opts.rawBody); } catch (e) { return { status: 400, body: { error: "bad json" } }; }

  if (i.type === 1) return { status: 200, body: { type: 1 } }; /* PING from Discord */

  if (i.type === 2 && i.data && i.data.name === "ask") {
    const opt = (i.data.options || []).find((o) => o.name === "question");
    const question = String((opt && opt.value) || "").trim().slice(0, 500);
    const userId = (i.member && i.member.user && i.member.user.id) || (i.user && i.user.id) || "unknown";
    if (!question) return privateMessage("Type your question after `/ask`, for example: `/ask When does MECS APAC start?`");
    if (limited(userId)) return privateMessage("You're asking a lot of questions quickly. Please wait a minute and try again.");

    const work = (async () => {
      const r = await assistant.answer([{ role: "user", parts: [{ text: question }] }], "discord");
      const text = r.ok ? r.text : r.error === "busy" ? BUSY : UNAVAILABLE;
      await editOriginal(i.application_id, i.token, buildReply(question, text));
    })().catch((e) => console.error("[discord] answer failed", e));

    if (typeof opts.waitUntil === "function") opts.waitUntil(work);
    return { status: 200, body: { type: 5 } }; /* "Assistant is thinking…" (public) */
  }

  return privateMessage("I don't know that command. Try `/ask`.");
}

/* ---------------------------------------------------------------------------
   One-time setup: registers /ask and checks everything is connected
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

  try {
    const res = await fetch(DISCORD_API + "/applications/" + appId + "/commands", {
      method: "PUT",
      headers: { Authorization: "Bot " + token, "Content-Type": "application/json" },
      body: JSON.stringify([ASK_COMMAND])
    });
    lines.push(res.ok ? "OK  /ask command registered with Discord" : "PROBLEM  Discord refused the /ask command (" + res.status + "). Check the Application ID and Bot Token.");
  } catch (e) {
    lines.push("PROBLEM  Could not reach Discord: " + e.message);
  }

  const fs = require("fs"), path = require("path");
  let channels = [];
  try { channels = JSON.parse(fs.readFileSync(path.join(__dirname, "knowledge", "discord.json"), "utf8")).channels || []; } catch (e) {}
  lines.push("");
  if (!channels.length) lines.push("Announcement channels: none set yet (api/knowledge/discord.json).");
  for (const c of channels) {
    try {
      const res = await fetch(DISCORD_API + "/channels/" + c.id + "/messages?limit=5", { headers: { Authorization: "Bot " + token } });
      if (!res.ok) { lines.push("PROBLEM  #" + (c.name || c.id) + ": the bot can't read this channel (" + res.status + "). Give the bot's role View Channel + Read Message History there."); continue; }
      const msgs = await res.json();
      const withText = msgs.filter((m) => m.content || (m.embeds && m.embeds.length)).length;
      lines.push((msgs.length && !withText ? "PROBLEM  #" : "OK  #") + (c.name || c.id) + ": can read it" +
        (msgs.length && !withText ? ", but the messages look empty. Turn on 'Message Content Intent' (Developer Portal > Bot)." : ""));
    } catch (e) {
      lines.push("PROBLEM  #" + (c.name || c.id) + ": " + e.message);
    }
  }
  lines.push("", "If everything says OK, type /ask in your server. A new command can take a minute to appear (restart Discord if it doesn't).");
  return lines.join("\n");
}

module.exports = { handleInteraction, setup, verifySignature, buildReply, toDiscordMarkdown, ASK_COMMAND };
