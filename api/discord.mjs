/* =============================================================================
   Mathatised Esports assistant: Discord endpoint (/api/discord)
   - POST: Discord sends /ask here (set as "Interactions Endpoint URL").
   - GET ?setup: registers /ask with Discord and checks the connection.
   The logic is in api/_discord.js.
============================================================================= */
import core from "./_discord.js";

/* waitUntil lets the answer be written after Discord gets its quick
   "thinking…" reply (Discord only waits 3 seconds for a first response). */
let waitUntilFn = null;
try { waitUntilFn = (await import("@vercel/functions")).waitUntil; } catch (e) { /* fallback below */ }
function getWaitUntil() {
  if (waitUntilFn) return waitUntilFn;
  const ctx = globalThis[Symbol.for("@vercel/request-context")];
  const c = ctx && typeof ctx.get === "function" ? ctx.get() : null;
  return c && typeof c.waitUntil === "function" ? c.waitUntil.bind(c) : null;
}

export async function POST(request) {
  const rawBody = await request.text();
  const result = await core.handleInteraction({
    rawBody,
    signature: request.headers.get("x-signature-ed25519"),
    timestamp: request.headers.get("x-signature-timestamp"),
    waitUntil: getWaitUntil()
  });
  return Response.json(result.body, { status: result.status });
}

export async function GET(request) {
  const url = new URL(request.url);
  const text = url.searchParams.has("setup")
    ? await core.setup()
    : "Mathatised Esports Discord bot endpoint.\nOpen this address with ?setup at the end to register the /ask command.";
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
