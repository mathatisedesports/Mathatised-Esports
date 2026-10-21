/* =============================================================================
   Mathatised Esports assistant: website chat endpoint (POST /api/chat)
   The answering itself lives in api/_assistant.js (shared with Discord).
============================================================================= */
"use strict";

const assistant = require("./_assistant.js");

const MAX_TURNS = 8;          /* messages of history sent to the model */
const MAX_USER_CHARS = 600;   /* per user message */
const MAX_BOT_CHARS = 2000;   /* per earlier assistant message */
const limited = assistant.makeLimiter(6, 60); /* per visitor: per minute, per day */

/* Only accept requests sent from pages on this same website. */
function sameOrigin(req) {
  const origin = req.headers.origin || req.headers.referer || "";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "";
  try { return !!origin && new URL(origin).host === host; } catch (e) { return false; }
}

function cleanHistory(body) {
  const list = body && Array.isArray(body.messages) ? body.messages.slice(-MAX_TURNS) : [];
  const out = [];
  for (const m of list) {
    if (!m || typeof m.text !== "string") continue;
    const role = m.role === "assistant" ? "model" : m.role === "user" ? "user" : null;
    if (!role) continue;
    const text = m.text.trim().slice(0, role === "user" ? MAX_USER_CHARS : MAX_BOT_CHARS);
    if (!text) continue;
    /* Gemini expects turns to alternate; merge any repeats */
    if (out.length && out[out.length - 1].role === role) out[out.length - 1].parts[0].text += "\n" + text;
    else out.push({ role, parts: [{ text }] });
  }
  while (out.length && out[0].role !== "user") out.shift();
  if (!out.length || out[out.length - 1].role !== "user") return null;
  return out;
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "method" }); }
  if (!sameOrigin(req)) return res.status(403).json({ error: "forbidden" });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: "unavailable" });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (limited(ip)) return res.status(429).json({ error: "rate" });

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const contents = cleanHistory(body);
  if (!contents) return res.status(400).json({ error: "bad_request" });

  const r = await assistant.answer(contents, "website");
  if (r.ok) return res.status(200).json({ reply: r.text });
  return res.status(r.error === "busy" ? 429 : 503).json({ error: r.error });
};
