/* =============================================================================
   Mathatised Esports assistant: strikes and blocks for the Discord bot
   The private staff channel set as "logChannel" in api/knowledge/discord.json
   is the record book: every strike, block and unblock is posted there as a
   message, and the bot reads those messages back to know who is blocked.

   Strike ladder (strikes older than 7 days don't count):
     1 = private warning, 2 = 30 minutes, 3 = 1 hour, 4 or more = 6 hours
============================================================================= */
"use strict";

const fs = require("fs");
const path = require("path");

const DISCORD_API = "https://discord.com/api/v10";
const MIN = 60 * 1000, HOUR = 60 * MIN, DAY = 24 * HOUR;
const STRIKE_WINDOW = 7 * DAY;
const LADDER = [0, 0, 30 * MIN, 1 * HOUR, 6 * HOUR]; /* index = strike number */
const COLORS = { strike: 0xd4ae55, block: 0xc0392b, unblock: 0x2e8b57, info: 0x16223f };

function logChannelId() {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "knowledge", "discord.json"), "utf8"));
    return /^\d{15,25}$/.test(String(cfg.logChannel || "")) ? String(cfg.logChannel) : null;
  } catch (e) { return null; }
}

function penaltyFor(strikes) {
  return LADDER[Math.min(strikes, LADDER.length - 1)] || 0;
}

function formatDuration(ms) {
  if (ms >= DAY && ms % DAY === 0) return (ms / DAY) + (ms === DAY ? " day" : " days");
  if (ms >= HOUR && ms % HOUR === 0) return (ms / HOUR) + (ms === HOUR ? " hour" : " hours");
  return Math.round(ms / MIN) + " minutes";
}

function parseDuration(text) {
  const m = String(text || "").trim().toLowerCase().match(/^(\d{1,4})\s*(m|min|mins|minutes?|h|hr|hrs|hours?|d|days?)$/);
  if (!m) return 0;
  const n = Number(m[1]);
  const ms = /^m/.test(m[2]) ? n * MIN : /^h/.test(m[2]) ? n * HOUR : n * DAY;
  return Math.min(ms, 90 * DAY);
}

/* ---------------------------------------------------------------------------
   Reading and writing the record book
   Each record is a bot message whose embed footer reads:
   MX1|type|userId|atMs|untilMs|by
--------------------------------------------------------------------------- */
function headers(token) {
  return { Authorization: "Bot " + token, "Content-Type": "application/json" };
}

function parseRecord(msg) {
  if (!msg || !msg.author || !msg.author.bot) return null;
  const footer = msg.embeds && msg.embeds[0] && msg.embeds[0].footer && msg.embeds[0].footer.text;
  const m = String(footer || "").match(/MX1\|(strike|block|unblock)\|(\d+)\|(\d+)\|(\d+)\|(\w+)/);
  return m ? { type: m[1], user: m[2], at: Number(m[3]), until: Number(m[4]), by: m[5] } : null;
}

let cache = { at: 0, records: null };
async function readRecords(token, fresh) {
  const channel = logChannelId();
  if (!token || !channel) return [];
  if (!fresh && cache.records && Date.now() - cache.at < 20 * 1000) return cache.records;
  const records = [];
  let before = "";
  for (let page = 0; page < 2; page++) {
    const res = await fetch(DISCORD_API + "/channels/" + channel + "/messages?limit=100" + before, { headers: headers(token) });
    if (!res.ok) throw new Error("bot-log " + res.status);
    const msgs = await res.json();
    msgs.forEach((m) => { const r = parseRecord(m); if (r) records.push(r); });
    if (msgs.length < 100) break;
    const last = msgs[msgs.length - 1];
    if (Date.parse(last.timestamp) < Date.now() - STRIKE_WINDOW) break;
    before = "&before=" + last.id;
  }
  records.sort((a, b) => a.at - b.at);
  cache = { at: Date.now(), records };
  return records;
}

/* Where a user stands: active strikes and any block */
function stateFor(records, userId, now) {
  now = now || Date.now();
  const mine = records.filter((r) => r.user === userId);
  const lastUnblock = mine.filter((r) => r.type === "unblock").reduce((t, r) => Math.max(t, r.at), 0);
  const since = Math.max(lastUnblock, now - STRIKE_WINDOW);
  const strikes = mine.filter((r) => r.type === "strike" && r.at > since);
  const blockedUntil = mine.filter((r) => r.type === "block" && r.at > lastUnblock).reduce((t, r) => Math.max(t, r.until), 0);
  return {
    strikes: strikes.length,
    lastStrikeAt: strikes.length ? strikes[strikes.length - 1].at : 0,
    blockedUntil: blockedUntil > now ? blockedUntil : 0
  };
}

async function writeRecord(token, record, description, color) {
  const channel = logChannelId();
  if (!token || !channel) return false;
  const footer = "MX1|" + record.type + "|" + record.user + "|" + record.at + "|" + (record.until || 0) + "|" + (record.by || "auto");
  const res = await fetch(DISCORD_API + "/channels/" + channel + "/messages", {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({
      embeds: [{ description: description.slice(0, 4000), color: color || COLORS.info, footer: { text: footer }, timestamp: new Date(record.at).toISOString() }],
      allowed_mentions: { parse: [] }
    })
  });
  if (!res.ok) { console.error("[moderation] could not write to bot-log", res.status, await res.text().catch(() => "")); return false; }
  if (cache.records) cache.records.push(record);
  return true;
}

function codeQuote(text) {
  return "```\n" + String(text || "").replace(/`/g, "ˋ").slice(0, 300) + "\n```";
}

/* ---------------------------------------------------------------------------
   Automatic strike (off-topic / abusive question, or spamming)
   Returns { strikes, blockMs, until, message } where message is the private
   reply for the user.
--------------------------------------------------------------------------- */
async function addStrike(token, userId, reason, question, kind) {
  const now = Date.now();
  let records = [];
  try { records = await readRecords(token, true); } catch (e) { console.warn("[moderation]", e.message); }
  const before = stateFor(records, userId, now);
  const strikes = before.strikes + 1;
  const blockMs = penaltyFor(strikes);
  const until = blockMs ? Math.max(now + blockMs, before.blockedUntil) : 0;

  await writeRecord(token, { type: "strike", user: userId, at: now, until: 0, by: "auto" },
    "⚠️ **Strike " + strikes + "** for <@" + userId + "> · " + reason + (question ? "\n" + codeQuote(question) : ""), COLORS.strike);
  if (blockMs) {
    await writeRecord(token, { type: "block", user: userId, at: now + 1, until, by: "auto" },
      "⛔ <@" + userId + "> blocked from the assistant for **" + formatDuration(blockMs) + "** (strike " + strikes + "), until <t:" + Math.floor(until / 1000) + ":f>", COLORS.block);
  }

  const message = blockMs
    ? "⛔ That's strike " + strikes + ". You can't use the assistant for **" + formatDuration(blockMs) + "** (until <t:" + Math.floor(until / 1000) + ":t>)."
    : kind === "spam"
      ? "⚠️ **Warning:** please don't spam the assistant. Spam and off-topic questions count as strikes, and strikes lead to short blocks from the assistant."
      : "⚠️ **Warning:** I can only help with Mathatised Esports questions. Off-topic, abusive or spam questions count as strikes, and strikes lead to short blocks from the assistant.";
  return { strikes, blockMs, until, message };
}

module.exports = {
  readRecords, stateFor, writeRecord, addStrike, parseDuration, formatDuration, penaltyFor, logChannelId, COLORS,
  _parseRecord: parseRecord
};
