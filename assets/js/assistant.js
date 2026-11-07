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
    { q: "How do I enter MECS Regionals?", chip: true,
      k: ["register", "registration", "sign up", "signup", "join mecs", "enter", "regional", "how to join", "how do i join", "apac", "eu"],
      a: "Registration for every **MECS Regional** happens in our Discord: [join the Discord](" + DISCORD + ") and follow the MECS registration process.\n\n- **2 players** in your main lineup, plus **1 substitute** if you want one\n- Your two main players need a combined **2,800 peak MMR** (any rank can enter)\n- Your Captain submits each player's **Discord ID**, **Epic Games ID** and **Rocket League Tracker** link\n\nFull details: [MECS Regionals](/mecs-regionals)." },
    { q: "When is the next MECS Regional?", chip: true,
      k: ["when", "dates", "schedule", "start", "next", "weekend", "november", "december", "timeline"],
      dyn: function () {
        var list = window.SITE && SITE.regionalsList ? SITE.regionalsList(10).filter(function (e) { return e.status !== "completed" && e.type !== "open"; }).slice(0, 4) : [];
        if (!list.length) return "Every month there are **MECS Regionals** in the Middle East, APAC and EU, plus the MECS Middle East 1v1 Showdown. See the [schedule](/mecs-regionals#schedule).";
        return "Here's what's coming up (all Saturday and Sunday):\n\n" +
          list.map(function (e) { return "- **" + e.when + ":** " + e.name + (e.status === "live" ? " (this weekend!)" : ""); }).join("\n") +
          "\n\nMatch times are posted in our [Discord](" + DISCORD + "). Full [schedule](/mecs-regionals#schedule).";
      },
      a: "Every month there are **MECS Regionals** in the Middle East, APAC and EU, plus the MECS Middle East 1v1 Showdown on the last weekend. See the [schedule](/mecs-regionals#schedule)." },
    { q: "Who can play? Is there a rank requirement?", chip: true,
      k: ["rank", "eligib", "requirement", "mmr", "who can play", "can i play", "peak", "champion rank"],
      a: "**No rank requirement!** For MECS Regionals, we add up your two main players' **peak MMR**:\n\n- Each player's highest peak MMR **across all formats** (1v1, 2v2, 3v3…) counts\n- The two together need **2,800**, and with the **50 MMR tolerance** a combined **2,750** still meets it\n- Your substitute doesn't count towards it\n\nTry the checker on the [MECS Regionals](/mecs-regionals#eligibility) page. Full details in Rule 3.13. You must play on your main account (Rule 3.2), and players must be at least 13 (Rule 3.1)." },
    { q: "How does the format work?", chip: true,
      k: ["format", "how does", "bracket", "double elimination", "2v2", "teams", "how many teams", "bo3", "bo5", "bo7", "saturday", "sunday", "grand final", "server"],
      a: "Every **MECS Regional** is a two-day event:\n\n- **8 teams**, **2v2**, with one optional substitute\n- **Double elimination**: lose once and you drop to the lower bracket, lose twice and you're out\n- **Saturday:** Upper Quarterfinals, Upper Semifinals, Lower Round 1 and Lower Quarterfinal (all BO3)\n- **Sunday:** Lower Semifinal (BO3), Upper and Lower Finals (BO5) and the Grand Final (BO7, with a bracket reset if the lower-bracket team wins the first series)\n- Livestreamed with casting, and the winners are crowned champion, e.g. **MECS APAC I Champion**\n\nSee [MECS Regionals](/mecs-regionals)." },    { q: "What happens if a player disconnects?", chip: true,
      k: ["disconnect", "dc", "lag", "crash", "connection", "pause", "timeout", "time out"],
      a: "Under **Rule 4.7**, the admin pauses the game and starts a **two-minute timer**. The player can rejoin, or a registered substitute can come in during the pause. If neither happens, the game continues shorthanded when the timer ends.\n\nEach team also gets **one two-minute timeout per series**, between games only (Rule 4.8). The [official rulebook](/assets/docs/mathatised-esports-rules-and-regulations.pdf) has the full details." },
    { q: "Where can I watch the matches?", chip: true,
      k: ["watch", "stream", "live", "youtube", "twitch", "kick", "broadcast", "vod", "cast"],
      a: "Every match is streamed live with casting on [YouTube](https://www.youtube.com/@Mathatised), [Twitch](https://twitch.tv/mathatised) and [Kick](https://kick.com/mathatised), and the best moments are shared as highlights and edits on YouTube Shorts, [TikTok](https://www.tiktok.com/@mathatised.esports), [Instagram](https://www.instagram.com/mathatisedesports/) and [Facebook](https://www.facebook.com/MathatisedEsports). Match-day announcements go out in our [Discord](" + DISCORD + ") first." },
    { q: "How can I join the Mathatised team?", chip: true,
      k: ["join the team", "staff", "job", "role", "caster", "admin", "referee", "volunteer", "editor", "designer", "social media", "apply", "hiring", "work for"],
      a: "We're looking for a **Caster**, **Match Admin & Referee**, **Tournament Assistant**, **Social Media Manager**, **Video Editor** and **Graphic Designer**. Each role has its own application form on [Join Us](/join-us).\n\nDon't see your role? [Send us a message](/contact)." },
    { q: "Can Mathatised run an event for us?", chip: true,
      k: ["host", "event", "organise", "organize", "run our", "our tournament", "brand", "school", "university", "showmatch", "creator"],
      a: "Yes. We design, run and broadcast esports competitions for brands, organisations, schools, universities and communities: format design, registration and seeding, match-day admin, broadcast, casting and content.\n\nTell us about it on [Host Your Event](/host-your-event) or email mathatisedesports@gmail.com." },
    { q: "How can my brand sponsor you?", chip: false,
      k: ["sponsor", "partner", "partnership", "advertis", "brand deal", "collab"],
      a: "Partners can be title or presenting partner, broadcast partner, prize partner, content partner or community partner, or build a custom package. Every package is tailored.\n\nStart on [Become a Sponsor](/sponsor) or email mathatisedesports@gmail.com." },
    { q: "What do the winners get?", chip: false,
      k: ["prize", "money", "reward", "payout", "paid", "cash", "win"],
      a: "Every **MECS Regional** is played for the title. Win the weekend and you're crowned champion, for example **MECS APAC I Champion**: the crown, the bragging rights and your name in MECS history 🏆 Your best plays also get turned into highlights shared across our channels." },
    { q: "What about MECS Middle East?", chip: false,
      k: ["middle east", "mena", "me edition", "me4", "two-legged", "two legged", "aggregate"],
      a: "**MECS Middle East** is our original four-week MECS championship (24 teams, Platinum rank or above, $150), played 10 October to 1 November.\n\n- **1st (Champion):** Nothing (Zwix, Izn, Troyz)\n- **2nd:** Fury X BomX (Zost, V7gro)\n- **3rd:** 7 (HMS, Rdlvv, Sighfive)\n\nSee [MECS Middle East](/mecs-middle-east).\n\nLooking to play in the Middle East now? The **MECS Regionals** come to the Middle East regularly. See the [schedule](/mecs-regionals#schedule)." },
    { q: "Who won the SPL?", chip: false,
      k: ["spl", "south asia", "premier league", "winner", "won", "champion", "results", "fury", "top five"],
      a: "The **South Asia Premier League** had two tournaments:\n\n- **3v3:** Team Top Five won, ahead of Team Pigeon Lovers and Team Revenant\n- **2v2:** Fury X BomX won, ahead of Kl Banana and UncsWhoDunc\n\nMore on the [SPL page](/spl)." },
    { q: "Can we have a substitute?", chip: false,
      k: ["sub", "substitute", "roster", "replace", "missing player", "player short", "shorthanded", "change player"],
      a: "Yes! In MECS Regionals each team has **2 main players and 1 optional substitute**. The sub doesn't count towards your combined MMR (Rule 3.6). After registration closes, rosters are locked, but your registered sub can step in between games, or during a disconnect pause (Rule 3.7). Tell an admin before the match." },
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

  /* Some answers (like the schedule) are worked out when asked */
  function answerOf(qa) {
    try { return typeof qa.dyn === "function" ? qa.dyn() : qa.a; } catch (e) { return qa.a; }
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
    '<p class="assistant-note">AI-generated. The <a href="/assets/docs/mathatised-esports-rules-and-regulations.pdf" target="_blank" rel="noopener">rulebook</a> has the final word.</p>';
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
    push("assistant", answerOf(qa));
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
    return qa ? OFFLINE_NOTE + "\n\n" + answerOf(qa) : FALLBACK;
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
