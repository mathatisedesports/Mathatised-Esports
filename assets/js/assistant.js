/* =============================================================================
   Mathatised Esports assistant: chat window
   Loaded by site.js the first time someone opens the chat.

   - Suggested questions are answered instantly from QUICK_ANSWERS below.
   - Typed questions go to /api/chat (Gemini, using api/knowledge/*.md).
   - If the AI is unavailable (no key, daily limit reached, offline, or the
     site is opened from a file), the closest quick answer is used instead.
   Keep QUICK_ANSWERS in step with the website, like api/knowledge/site.md.
============================================================================= */
(function () {
  "use strict";
  var SITE = window.SITE || {};
  var DISCORD = "https://discord.gg/EbATfBadDv";
  var STORE = "mx-assistant";
  var MAX_LEN = 600;

  /* ---------------------------------------------------------------------------
     Quick answers. "k" = words or phrases that point to this answer.
  --------------------------------------------------------------------------- */
  var QUICK_ANSWERS = [
    { q: "How do I register for MECS APAC?", chip: true,
      k: ["register", "registration", "sign up", "signup", "join mecs", "enter", "apac", "how to join", "how do i join"],
      a: "Registration for **MECS APAC** is open in our Discord: [join the Discord](" + DISCORD + ") and follow the MECS registration process.\n\n- Your Captain submits each player's **Discord ID**, **Epic Games ID** and **Rocket League Tracker** link\n- Every player needs **Champion rank or above**\n- Up to **one substitute** per team\n- You're confirmed once your team is added to the Registered channel\n\nFull details: [MECS APAC](/mecs-apac)." },
    { q: "When is MECS APAC?", chip: true,
      k: ["when", "dates", "schedule", "start", "apac date", "november", "timeline"],
      a: "**MECS APAC** runs over four weekends:\n\n- **7–8 Nov:** Group Stage\n- **14–15 Nov:** Qualifiers\n- **21–22 Nov:** Championship Bracket, opening rounds\n- **28–29 Nov:** Quarterfinals to Grand Final\n\nThe champion is crowned on 29 November. See the [schedule](/mecs-apac#schedule)." },
    { q: "What rank do I need?", chip: true,
      k: ["rank", "eligib", "champion rank", "platinum", "requirement", "mmr", "who can play", "can i play"],
      a: "It depends on the edition:\n\n- **MECS APAC:** Champion rank or above\n- **MECS Middle East:** Platinum rank or above (registration is closed)\n\nYou must play on your main account, and accounts can be reviewed (Rule 3.2). Players must be at least 13 (Rule 3.1)." },
    { q: "How does the MECS format work?", chip: true,
      k: ["format", "how does", "group stage", "qualifier", "bracket", "double elimination", "swiss", "bo3", "bo5", "bo7", "bracket reset", "grand final"],
      a: "Every MECS edition has **24 teams** over **four weekends**:\n\n- **Group Stage:** 8 groups of 3, BO3. 1st goes straight to the bracket, 2nd to qualification, 3rd is out\n- **Qualifiers (APAC):** two Swiss groups of 4, top 2 in each advance\n- **Championship Bracket:** 12 teams, double elimination, BO3 → BO5 → BO7, with a Grand Final bracket reset\n\nMECS Middle East used a two-legged qualification round instead. See [MECS](/mecs)." },
    { q: "What happens if a player disconnects?", chip: true,
      k: ["disconnect", "dc", "lag", "crash", "connection", "pause", "timeout", "time out"],
      a: "Under **Rule 4.7**, the admin pauses the game and starts a **two-minute timer**. The player can rejoin, or a registered substitute can come in during the pause. If neither happens, the game continues shorthanded when the timer ends.\n\nEach team also gets **one two-minute timeout per series**, between games only (Rule 4.8). The [official rulebook](/assets/docs/mecs-rules-and-regulations.pdf) has the full details." },
    { q: "Where can I watch the matches?", chip: true,
      k: ["watch", "stream", "live", "youtube", "twitch", "broadcast", "vod", "cast"],
      a: "Match days are streamed live with casting on [YouTube](https://www.youtube.com/@Mathatised) and [Twitch](https://twitch.tv/mathatised). Match-day announcements go out in our [Discord](" + DISCORD + ") first." },
    { q: "How can I join the Mathatised team?", chip: true,
      k: ["join the team", "staff", "job", "role", "caster", "admin", "referee", "volunteer", "editor", "designer", "social media", "apply", "hiring", "work for"],
      a: "We're looking for a **Caster**, **Match Admin & Referee**, **Tournament Assistant**, **Social Media Manager**, **Video Editor** and **Graphic Designer**. Each role has its own application form on [Join Us](/join-us).\n\nDon't see your role? [Send us a message](/contact)." },
    { q: "Can Mathatised run an event for us?", chip: true,
      k: ["host", "event", "organise", "organize", "run our", "our tournament", "brand", "school", "university", "showmatch", "creator"],
      a: "Yes. We design, run and broadcast esports competitions for brands, organisations, schools, universities and communities: format design, registration and seeding, match-day admin, broadcast, casting and content.\n\nTell us about it on [Host Your Event](/host-your-event) or email mathatisedesports@gmail.com." },
    { q: "How can my brand sponsor you?", chip: false,
      k: ["sponsor", "partner", "partnership", "advertis", "brand deal", "collab"],
      a: "Partners can be title or presenting partner, broadcast partner, prize partner, content partner or community partner, or build a custom package. Every package is tailored.\n\nStart on [Become a Sponsor](/sponsor) or email mathatisedesports@gmail.com." },
    { q: "What's the prize pool?", chip: false,
      k: ["prize", "money", "reward", "payout", "paid", "cash", "win"],
      a: "Each MECS edition has a **$150** prize pool. Prizes go to one person nominated by the winning team, and are generally paid within 7 working days of final results (Rule 11). For us, the prize isn't the main point: MECS is a stage to compete against high-level players and get seen." },
    { q: "What about MECS Middle East?", chip: false,
      k: ["middle east", "mena", "me edition", "me4", "two-legged", "two legged", "aggregate"],
      a: "**MECS Middle East** is our first edition (Platinum rank or above, $150). The Group Stage (10–11 Oct) and Two-Legged Qualification (17–18 Oct) are done. The Championship Bracket is played on **24–25 Oct** and **31 Oct – 1 Nov**, with the champion crowned on 1 November. See [MECS Middle East](/mecs-middle-east)." },
    { q: "Who won the SPL?", chip: false,
      k: ["spl", "south asia", "premier league", "winner", "won", "champion", "results", "fury", "top five"],
      a: "The **South Asia Premier League** had two tournaments:\n\n- **3v3:** Team Top Five won, ahead of Team Pigeon Lovers and Team Revenant\n- **2v2:** Fury X BomX won, ahead of Kl Banana and UncsWhoDunc\n\nMore on the [SPL page](/spl)." },
    { q: "Can we have a substitute?", chip: false,
      k: ["sub", "substitute", "roster", "replace", "missing player", "player short", "shorthanded", "change player"],
      a: "Yes, each team can register **up to one substitute** (Rule 3.6). After registration closes, rosters are locked, but your registered sub can step in between games, or during a disconnect pause (Rule 3.7). Tell an admin before the match." },
    { q: "Is there an entry fee?", chip: false,
      k: ["fee", "cost", "pay to", "free to", "price", "entry"],
      a: "Entry costs aren't listed on the website. Please ask in our [Discord](" + DISCORD + ") and the team will confirm." },
    { q: "How do I contact you?", chip: false,
      k: ["contact", "email", "reach", "talk to", "support", "help", "ticket", "dispute", "report"],
      a: "Discord is the fastest way to reach us, and tournament support, disputes and reports go through the Discord ticket system (Rules 5.3 and 6.1): [join the Discord](" + DISCORD + "). You can also email mathatisedesports@gmail.com or use the [contact form](/contact)." }
  ];

  var GREETING = "Hey there! 👋 I'm the Mathatised Esports assistant. Ask me anything about **MECS**, our competitions, the rules, schedules, joining the team or working with us!";
  var FALLBACK = "Ooh, I don't know that one, sorry! 😅 The quickest way to get an answer is our [Discord](" + DISCORD + "), or you can [send us a message](/contact).";
  var OFFLINE_NOTE = "_The AI assistant isn't available right now, so here's the closest quick answer._";

  /* ---------------------------------------------------------------------------
     Helpers
  --------------------------------------------------------------------------- */
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function norm(s) { return " " + String(s).toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ") + " "; }

  function safeUrl(u) {
    u = u.trim();
    if (/^https:\/\//i.test(u) || /^mailto:/i.test(u)) return u;
    if (/^\/(?!\/)/.test(u)) return u;
    return null;
  }

  /* Minimal, safe Markdown: **bold**, _italic_, [text](url), "- " lists, paragraphs */
  function inline(text) {
    var out = esc(text);
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, url) {
      var u = safeUrl(url.replace(/&amp;/g, "&"));
      if (!u) return label;
      var ext = /^https?:/i.test(u);
      return '<a href="' + esc(u) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + label + "</a>";
    });
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/(^|[\s(])_([^_]+)_(?=[\s).,!?]|$)/g, "$1<em>$2</em>");
    out = out.replace(/(^|[\s(])(mathatisedesports@gmail\.com)/g, '$1<a href="mailto:$2">$2</a>');
    return out;
  }
  function render(md) {
    var LIST = /^\s*([-*•]|\d+\.)\s+/;
    var html = "", para = [], items = [];
    function flushPara() { if (para.length) { html += "<p>" + para.map(inline).join("<br>") + "</p>"; para = []; } }
    function flushList() { if (items.length) { html += "<ul>" + items.map(function (l) { return "<li>" + inline(l) + "</li>"; }).join("") + "</ul>"; items = []; } }
    String(md).replace(/\r/g, "").split("\n").forEach(function (line) {
      if (!line.trim()) { flushPara(); flushList(); return; }
      if (LIST.test(line)) { flushPara(); items.push(line.replace(LIST, "")); return; }
      flushList();
      var h = line.match(/^\s*#{1,6}\s+(.*)$/);
      para.push(h ? "**" + h[1].replace(/\*\*/g, "") + "**" : line);
    });
    flushPara(); flushList();
    return html;
  }

  function bestQuickAnswer(question) {
    var n = norm(question), best = null, bestScore = 0;
    QUICK_ANSWERS.forEach(function (qa) {
      var score = 0;
      qa.k.forEach(function (k) { if (n.indexOf(" " + k) !== -1) score += k.indexOf(" ") !== -1 ? 2 : 1; });
      if (score > bestScore) { bestScore = score; best = qa; }
    });
    return bestScore > 0 ? best : null;
  }

  function load() { try { return JSON.parse(sessionStorage.getItem(STORE)) || []; } catch (e) { return []; } }
  function save(list) { try { sessionStorage.setItem(STORE, JSON.stringify(list.slice(-30))); } catch (e) {} }

  /* ---------------------------------------------------------------------------
     UI
  --------------------------------------------------------------------------- */
  var launcher = document.querySelector(".assistant-launcher");
  var panel = document.createElement("div");
  panel.className = "assistant";
  panel.id = "assistant-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Mathatised Esports assistant");
  panel.hidden = true;
  panel.innerHTML =
    '<div class="assistant-head">' +
      '<img src="assets/img/logo-160.webp" width="36" height="36" alt="">' +
      '<div><p class="assistant-title">Mathatised Assistant</p><p class="assistant-sub">Answers from our website and rulebook</p></div>' +
      '<button class="assistant-icon-btn assistant-reset" type="button" aria-label="Start a new chat" title="New chat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg></button>' +
      '<button class="assistant-icon-btn assistant-close" type="button" aria-label="Close chat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>' +
    "</div>" +
    '<div class="assistant-log" aria-live="polite"></div>' +
    '<form class="assistant-form" novalidate>' +
      '<label class="sr-only" for="assistant-input">Your question</label>' +
      '<textarea id="assistant-input" rows="1" maxlength="' + MAX_LEN + '" placeholder="Ask a question…" autocomplete="off"></textarea>' +
      '<button class="assistant-send" type="submit" aria-label="Send"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></button>' +
    "</form>" +
    '<p class="assistant-note">AI-generated. The <a href="/assets/docs/mecs-rules-and-regulations.pdf" target="_blank" rel="noopener">rulebook</a> has the final word.</p>';
  document.body.appendChild(panel);

  var log = panel.querySelector(".assistant-log");
  var form = panel.querySelector(".assistant-form");
  var input = panel.querySelector("textarea");
  var sendBtn = panel.querySelector(".assistant-send");
  var history = load();
  var busy = false;

  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function bubble(role, md) {
    var el = document.createElement("div");
    el.className = "assistant-msg assistant-msg--" + (role === "user" ? "user" : "bot");
    if (role === "user") el.textContent = md; else el.innerHTML = render(md);
    log.appendChild(el);
    scrollDown();
    return el;
  }

  function chips() {
    var wrap = document.createElement("div");
    wrap.className = "assistant-chips";
    QUICK_ANSWERS.filter(function (qa) { return qa.chip; }).forEach(function (qa) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "assistant-chip";
      b.textContent = qa.q;
      b.addEventListener("click", function () { if (!busy) quick(qa); });
      wrap.appendChild(b);
    });
    log.appendChild(wrap);
  }

  function drawAll() {
    log.innerHTML = "";
    bubble("bot", GREETING);
    if (!history.length) chips();
    history.forEach(function (m) { bubble(m.role, m.text); });
  }

  function push(role, text) {
    history.push({ role: role, text: text });
    save(history);
    bubble(role, text);
  }

  function quick(qa) {
    var c = log.querySelector(".assistant-chips");
    if (c) c.remove();
    push("user", qa.q);
    push("assistant", qa.a);
  }

  function typing() {
    var el = document.createElement("div");
    el.className = "assistant-msg assistant-msg--bot assistant-typing";
    el.setAttribute("aria-label", "Assistant is typing");
    el.innerHTML = "<span></span><span></span><span></span>";
    log.appendChild(el);
    scrollDown();
    return el;
  }

  function fallbackFor(question, reason) {
    var qa = bestQuickAnswer(question);
    if (reason === "rate") return "You've sent a lot of questions in a short time. Please wait a minute and try again, or ask in our [Discord](" + DISCORD + ").";
    return qa ? OFFLINE_NOTE + "\n\n" + qa.a : FALLBACK;
  }

  function ask(question) {
    var c = log.querySelector(".assistant-chips");
    if (c) c.remove();
    push("user", question);
    busy = true; sendBtn.disabled = true;
    var dots = typing();
    function done(text) { dots.remove(); push("assistant", text); busy = false; sendBtn.disabled = false; }

    if (location.protocol === "file:" || !window.fetch) { done(fallbackFor(question)); return; }

    var controller = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, 30000);
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-8) }),
      signal: controller ? controller.signal : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) { return { ok: r.ok, data: data }; });
    }).then(function (r) {
      clearTimeout(timer);
      if (r.ok && r.data && typeof r.data.reply === "string" && r.data.reply.trim()) done(r.data.reply.trim());
      else done(fallbackFor(question, r.data && r.data.error));
    }).catch(function () {
      clearTimeout(timer);
      done(fallbackFor(question));
    });
  }

  function open() {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("assistant-open");
    scrollDown();
    setTimeout(function () { input.focus(); }, 30);
  }
  function close() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("assistant-open");
    launcher.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q || busy) return;
    input.value = "";
    input.style.height = "";
    ask(q.slice(0, MAX_LEN));
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true })); }
  });
  input.addEventListener("input", function () {
    input.style.height = "";
    input.style.height = Math.min(input.scrollHeight, 120) + "px";
  });
  panel.querySelector(".assistant-close").addEventListener("click", close);
  panel.querySelector(".assistant-reset").addEventListener("click", function () {
    history = []; save(history); drawAll(); input.focus();
  });
  panel.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  launcher.addEventListener("click", function () { if (panel.hidden) open(); else close(); });

  drawAll();
  window.MXAssistant = { open: open, close: close };
  open();
})();
