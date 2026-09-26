/* =============================================================================
   MATHATISED ESPORTS — SHARED COMPONENTS & BEHAVIOUR
   Content lives in config.js. This file renders the shared pieces
   (header, footer, cards, icons) and wires up interactions.
   ========================================================================== */
(function () {
  "use strict";

  var SITE = window.SITE;
  var doc = document;
  var page = doc.body.getAttribute("data-page") || "";

  /* ---------------------------------------------------------------------------
     Helpers
  --------------------------------------------------------------------------- */
  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function $all(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function isExternal(url) { return /^https?:\/\//i.test(url); }
  function isPlaceholder(url) { return !url || /^\[.*\]$/.test(String(url).trim()); }
  function social(key) {
    for (var i = 0; i < SITE.socials.length; i++) if (SITE.socials[i].key === key) return SITE.socials[i];
    return null;
  }
  function extAttrs(url) { return isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : ""; }

  /* Resolve a named link: "email", a social key ("discord"…), or "form:<key>". */
  function resolveLink(key, topic) {
    if (key === "email") return "mailto:" + SITE.email;
    if (key.indexOf("form:") === 0) {
      var url = SITE.forms[key.slice(5)];
      if (!isPlaceholder(url)) return url;
      return "contact.html?topic=" + encodeURIComponent(topic || "General application") + "#contact-form";
    }
    var s = social(key);
    return s ? s.url : "index.html";
  }

  /* ---------------------------------------------------------------------------
     Icons (24×24 stroke icons; brand glyphs in the same outline style)
  --------------------------------------------------------------------------- */
  var ICONS = {
    discord: '<path d="M8 12a1 1 0 1 0 2 0a1 1 0 0 0-2 0"/><path d="M14 12a1 1 0 1 0 2 0a1 1 0 0 0-2 0"/><path d="M15.5 17c0 1 1.5 3 2 3c1.5 0 2.833-1.667 3.5-3c.667-1.667.5-5.833-1.5-11.5c-1.457-1.015-3-1.34-4.5-1.5l-.972 1.923a11.913 11.913 0 0 0-4.053 0l-.975-1.923c-1.5.16-3.043.485-4.5 1.5c-2 5.667-2.167 9.833-1.5 11.5c.667 1.333 2 3 3.5 3c.5 0 2-2 2-3"/><path d="M7 16.5c3.5 1 6.5 1 10 0"/>',
    youtube: '<path d="M2 8a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4z"/><path d="M10 9l5 3l-5 3z"/>',
    twitch: '<path d="M4 5v11a1 1 0 0 0 1 1h2v4l4-4h5.584c.266 0 .52-.105.707-.293l2.415-2.414c.187-.188.293-.442.293-.708V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1z"/><path d="M16 8v4"/><path d="M12 8v4"/>',
    tiktok: '<path d="M21 7.917v4.034a9.948 9.948 0 0 1-5-1.951v4.5a6.5 6.5 0 1 1-8-6.326v4.326a2.5 2.5 0 1 0 4 2V3h4.083A6.005 6.005 0 0 0 21 7.917z"/>',
    instagram: '<path d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0"/><path d="M16.5 7.5v.01"/>',
    facebook: '<path d="M7 10v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3h-3a5 5 0 0 0-5 5v2H7"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/>',
    broadcast: '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>',
    star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
    sparkle: '<path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3z"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20a14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    pin: '<path d="M20 10c0 4.99-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 14.99 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9a9 9 0 1 1-9-9Z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/><path d="m10 7 5 3-5 3z"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    layers: '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    list: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8M13 12h8M13 18h8"/>',
    video: '<path d="m16 13 5.22 3.48a.5.5 0 0 0 .78-.42V7.94a.5.5 0 0 0-.76-.43L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
    chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
    bracket: '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3M12 12V8"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    growth: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    enter: '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5M15 12H3"/>',
    crosshair: '<circle cx="12" cy="12" r="10"/><path d="M22 12h-4M6 12H2M12 6V2M12 22v-4"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
    building: '<rect width="16" height="20" x="4" y="2" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
    school: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    gamepad: '<path d="M6 12h4M8 10v4"/><path d="M15 13h.01M18 11h.01"/><rect width="20" height="12" x="2" y="6" rx="2"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'
  };
  function icon(name, cls) {
    var body = ICONS[name] || ICONS.sparkle;
    return '<svg class="icon i-' + name + " " + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + body + "</svg>";
  }

  function socialIcons(variant) {
    return '<ul class="social-list ' + (variant ? "social-list--" + variant : "") + '">' +
      SITE.socials.map(function (s) {
        return '<li><a class="social-btn" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(s.label) + ' (opens in a new tab)" title="' + esc(s.label) + '">' + icon(s.key) + "</a></li>";
      }).join("") + "</ul>";
  }

  /* ---------------------------------------------------------------------------
     Header
  --------------------------------------------------------------------------- */
  function brand(extraClass) {
    return '<a class="brand ' + (extraClass || "") + '" href="index.html" aria-label="Mathatised eSports — home">' +
      '<img class="brand-mark" src="assets/img/mathatised-mark-160.webp" width="44" height="44" alt="">' +
      '<span class="brand-text"><span class="brand-name">Mathatised</span><span class="brand-sub">eSports</span></span></a>';
  }

  function renderHeader() {
    var mount = doc.getElementById("site-header");
    if (!mount) return;

    var desktop = SITE.nav.map(function (item, i) {
      if (item.children) {
        var active = item.children.some(function (c) { return c.page === page; });
        return '<li class="has-dropdown">' +
          '<button class="nav-link nav-dd-toggle' + (active ? " is-active" : "") + '" type="button" aria-expanded="false" aria-controls="dd-' + i + '">' +
          esc(item.label) + icon("chevron", "chev") + "</button>" +
          '<div class="dropdown" id="dd-' + i + '"><ul>' +
          item.children.map(function (c) {
            return '<li><a href="' + c.href + '"' + (c.page === page ? ' aria-current="page"' : "") + '><span class="dd-title">' + esc(c.label) + '</span><span class="dd-text">' + esc(c.text) + "</span></a></li>";
          }).join("") + "</ul></div></li>";
      }
      return '<li><a class="nav-link' + (item.page === page ? " is-active" : "") + '" href="' + item.href + '"' + (item.page === page ? ' aria-current="page"' : "") + ">" + esc(item.label) + "</a></li>";
    }).join("");

    var mobile = SITE.nav.map(function (item) {
      if (item.children) {
        return '<li class="m-group"><span class="m-group-label">' + esc(item.label) + "</span><ul>" +
          item.children.map(function (c) {
            return '<li><a href="' + c.href + '"' + (c.page === page ? ' aria-current="page"' : "") + ">" + esc(c.label) + "</a></li>";
          }).join("") + "</ul></li>";
      }
      return '<li><a href="' + item.href + '"' + (item.page === page ? ' aria-current="page"' : "") + ">" + esc(item.label) + "</a></li>";
    }).join("");

    mount.className = "site-header";
    mount.innerHTML =
      '<div class="container header-inner">' + brand() +
      '<nav class="main-nav" aria-label="Main"><ul>' + desktop + "</ul></nav>" +
      '<div class="header-actions">' +
      '<button class="icon-btn theme-toggle" type="button" aria-label="Switch to dark theme">' + icon("moon", "i-moon") + icon("sun", "i-sun") + "</button>" +
      '<a class="btn btn-gold btn-sm header-cta" href="' + esc(social("discord").url) + '" target="_blank" rel="noopener noreferrer">Join the Community</a>' +
      '<button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">' + icon("menu", "i-menu") + icon("close", "i-close") + "</button>" +
      "</div></div>";
    /* The menu sits outside the header: the header's backdrop-filter would
       otherwise become the containing block for this fixed-position panel. */
    mount.insertAdjacentHTML("afterend",
      '<div class="mobile-menu" id="mobile-menu" hidden><div class="container">' +
      '<nav aria-label="Mobile"><ul class="m-list">' + mobile + "</ul></nav>" +
      '<a class="btn btn-gold btn-block" href="' + esc(social("discord").url) + '" target="_blank" rel="noopener noreferrer">Join the Community</a>' +
      socialIcons() + "</div></div>");
  }

  /* ---------------------------------------------------------------------------
     Footer
  --------------------------------------------------------------------------- */
  function renderFooter() {
    var mount = doc.getElementById("site-footer");
    if (!mount) return;
    var explore = [];
    SITE.nav.forEach(function (n) { if (!n.children) explore.push(n); });
    var partner = [
      { label: "Host Your Event", href: "host-your-event.html" },
      { label: "Become a Sponsor", href: "sponsor.html" },
      { label: "South Asia Premier League", href: "spl.html" },
      { label: "Send Us a Message", href: "contact.html#contact-form" }
    ];
    function links(list) {
      return "<ul>" + list.map(function (l) {
        return '<li><a href="' + esc(l.href || l.url) + '"' + extAttrs(l.href || l.url) + ">" + esc(l.label) + "</a></li>";
      }).join("") + "</ul>";
    }
    mount.className = "site-footer";
    mount.innerHTML =
      '<div class="container">' +
      '<div class="footer-grid">' +
      '<div class="footer-brand">' + brand("brand--light") + "<p>" + esc(SITE.tagline) + "</p>" + socialIcons("dark") + "</div>" +
      '<div class="footer-col"><h2 class="footer-title">Explore</h2>' + links(explore) + "</div>" +
      '<div class="footer-col"><h2 class="footer-title">Work With Us</h2>' + links(partner) + "</div>" +
      '<div class="footer-col"><h2 class="footer-title">Community</h2>' + links(SITE.socials) + "</div>" +
      '<div class="footer-col"><h2 class="footer-title">Contact</h2>' +
      '<p><a class="footer-email" href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + "</a></p>" +
      '<a class="btn btn-gold btn-sm" href="' + esc(social("discord").url) + '" target="_blank" rel="noopener noreferrer">Join the Community</a></div>' +
      "</div>" +
      '<div class="footer-bottom"><p>&copy; ' + new Date().getFullYear() + " " + esc(SITE.name) + '</p><p class="pillars">' +
      SITE.pillars.map(esc).join(' <span aria-hidden="true">·</span> ') + "</p></div></div>";
  }

  /* ---------------------------------------------------------------------------
     Content renderers  (<div data-render="…">)
  --------------------------------------------------------------------------- */
  var renderers = {
    socials: function (el) { el.innerHTML = socialIcons(el.getAttribute("data-variant")); },

    competitions: function (el) {
      var compact = el.getAttribute("data-variant") === "compact";
      el.innerHTML = SITE.competitions.map(function (c) {
        var rows = [];
        if (c.game) rows.push(["Game", c.game]);
        rows.push(["Format", c.format]);
        rows.push(["Dates", c.dates]);
        if (c.result) rows.push(["Result", c.result]);
        return '<article class="card comp-card comp-card--' + c.status + '">' +
          '<div class="comp-top">' +
          '<img class="comp-logo" src="' + esc(c.logo) + '" alt="' + esc(c.name) + ' logo" width="72" height="72" loading="lazy">' +
          '<span class="status status--' + c.status + '"><span class="status-dot" aria-hidden="true"></span>' + esc(c.statusLabel) + "</span></div>" +
          '<p class="comp-code">' + esc(c.code) + "</p>" +
          '<h3 class="comp-name">' + esc(c.name) + "</h3>" +
          '<p class="comp-desc">' + esc(c.description) + "</p>" +
          '<dl class="comp-meta">' + rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd></div>"; }).join("") + "</dl>" +
          '<a class="btn btn-outline btn-sm" href="' + c.href + '">' + (compact ? "Explore Competition" : "View Competition") + icon("arrow") +
          '<span class="sr-only"> — ' + esc(c.name) + "</span></a></article>";
      }).join("");
    },

    team: function (el) {
      el.innerHTML = SITE.team.map(function (m) {
        var socials = (m.socials || []).map(function (s) {
          var meta = social(s.key) || { label: s.key };
          return '<li><a class="social-btn social-btn--sm" href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer" aria-label="' + esc(m.name + " on " + meta.label) + '">' + icon(s.key) + "</a></li>";
        }).join("");
        return '<article class="card team-card">' +
          '<div class="team-photo"><img src="' + esc(m.image) + '" alt="' + (/^\[/.test(m.name) ? "" : "Portrait of " + esc(m.name)) + '" loading="lazy" width="400" height="400"><span class="team-tag">' + esc(m.tag) + "</span></div>" +
          '<div class="team-body"><h3 class="team-name">' + esc(m.name) + '</h3><p class="team-role">' + esc(m.role) + "</p>" +
          '<p class="team-bio">' + esc(m.bio) + "</p>" +
          (m.region ? '<p class="team-region">' + icon("pin") + esc(m.region) + "</p>" : "") +
          (socials ? '<ul class="social-list team-socials">' + socials + "</ul>" : "") +
          "</div></article>";
      }).join("");
    },

    roles: function (el) {
      var numbered = el.getAttribute("data-variant") === "numbered";
      el.innerHTML = SITE.roles.map(function (r, i) {
        var href = resolveLink("form:" + r.form, r.topic);
        return '<article class="card role-card">' +
          (numbered ? '<p class="eyebrow eyebrow--sm">Role ' + (i + 1) + "</p>" : '<span class="card-icon">' + icon(r.icon) + "</span>") +
          '<h3 class="card-title">' + esc(r.title) + "</h3><p>" + esc(r.text) + "</p>" +
          '<a class="btn btn-gold btn-sm" href="' + esc(href) + '"' + extAttrs(href) + ">" + esc(r.cta) + "</a></article>";
      }).join("");
    },

    countries: function (el) {
      el.innerHTML = '<ul class="chip-list">' + SITE.countries.map(function (c) {
        return '<li class="chip">' + esc(c) + "</li>";
      }).join("") + '<li class="chip chip--muted">and other participating regions</li></ul>';
    },

    "spl-tournaments": function (el) {
      el.innerHTML = SITE.spl.tournaments.map(function (t) {
        return '<article class="card spl-card">' +
          '<h3 class="card-title">' + esc(t.name) + "</h3>" +
          '<ul class="dot-list">' + t.facts.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
          '<h4 class="mini-label">Match days</h4><ul class="chip-list chip-list--sm">' +
          t.matchDays.map(function (d) { return '<li class="chip chip--square">' + esc(d) + "</li>"; }).join("") + "</ul>" +
          '<h4 class="mini-label">Final placements</h4><ol class="placements">' +
          t.placements.map(function (p, i) {
            return '<li class="placement placement--' + (i + 1) + '">' + icon(i === 0 ? "trophy" : "award") + '<span class="place">' + esc(p.place) + '</span><span class="team">' + esc(p.team) + "</span></li>";
          }).join("") + "</ol></article>";
      }).join("");
    },

    "spl-stats": function (el) {
      if (SITE.spl.stats && SITE.spl.stats.length) {
        el.innerHTML = '<dl class="stat-row">' + SITE.spl.stats.map(function (s) {
          return "<div><dt>" + esc(s.label) + "</dt><dd>" + esc(s.value) + "</dd></div>";
        }).join("") + "</dl>";
      } else {
        el.innerHTML = '<p class="placeholder-note">[PLACEHOLDER] Viewership, prize pool and production statistics to be added once confirmed.</p>';
      }
    },

    "contact-topics": function (el) {
      el.innerHTML = '<option value="" disabled selected>Choose a topic</option>' +
        SITE.contactTopics.map(function (t) { return '<option value="' + esc(t) + '">' + esc(t) + "</option>"; }).join("");
    }
  };

  function renderAll() {
    $all("[data-render]").forEach(function (el) {
      var fn = renderers[el.getAttribute("data-render")];
      if (fn) fn(el);
    });
    /* Named links: <a data-link="discord|youtube|email|form:casting"> */
    $all("[data-link]").forEach(function (a) {
      var url = resolveLink(a.getAttribute("data-link"), a.getAttribute("data-topic"));
      a.setAttribute("href", url);
      if (isExternal(url)) { a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener noreferrer"); }
    });
    $all("[data-email-text]").forEach(function (el) { el.textContent = SITE.email; });
    $all("[data-icon]").forEach(function (el) { el.innerHTML = icon(el.getAttribute("data-icon")); });
  }

  /* ---------------------------------------------------------------------------
     Theme toggle (light by default; choice remembered)
  --------------------------------------------------------------------------- */
  function initTheme() {
    var root = doc.documentElement;
    function sync() {
      var dark = root.getAttribute("data-theme") === "dark";
      $all(".theme-toggle").forEach(function (b) {
        b.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
        b.setAttribute("aria-pressed", dark ? "true" : "false");
      });
    }
    $all(".theme-toggle").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem("mx-theme", next); } catch (e) { /* storage unavailable */ }
        sync();
      });
    });
    sync();
  }

  /* ---------------------------------------------------------------------------
     Navigation: sticky shadow, mobile menu, dropdown
  --------------------------------------------------------------------------- */
  function initNav() {
    var header = doc.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var toggle = header.querySelector(".nav-toggle");
    var menu = doc.getElementById("mobile-menu");
    function setMenu(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      header.classList.toggle("menu-open", open);
      doc.body.classList.toggle("no-scroll", open);
      if (open) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add("is-open"); }); }
      else { menu.classList.remove("is-open"); menu.hidden = true; }
    }
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    $all("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1180 && !menu.hidden) setMenu(false); });

    $all(".nav-dd-toggle", header).forEach(function (btn) {
      var li = btn.parentNode;
      function set(open) { btn.setAttribute("aria-expanded", open ? "true" : "false"); li.classList.toggle("is-open", open); }
      btn.addEventListener("click", function (e) { e.stopPropagation(); set(btn.getAttribute("aria-expanded") !== "true"); });
      li.addEventListener("mouseenter", function () { if (window.matchMedia("(hover: hover)").matches) set(true); });
      li.addEventListener("mouseleave", function () { if (window.matchMedia("(hover: hover)").matches) set(false); });
      li.addEventListener("focusout", function (e) { if (!li.contains(e.relatedTarget)) set(false); });
      doc.addEventListener("click", function () { set(false); });
    });

    doc.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (!menu.hidden) { setMenu(false); toggle.focus(); }
      $all(".has-dropdown.is-open", header).forEach(function (li) {
        li.classList.remove("is-open");
        var b = li.querySelector(".nav-dd-toggle");
        b.setAttribute("aria-expanded", "false");
        b.focus();
      });
    });
  }

  /* ---------------------------------------------------------------------------
     Scroll reveal (skipped for reduced-motion users)
  --------------------------------------------------------------------------- */
  function initReveal() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    /* Tab panels are excluded: hidden panels never intersect, so they'd stay invisible. */
    var items = $all("main .section .section-head, main .section .card:not(.tabpanel), main .reveal");
    if (reduce || !("IntersectionObserver" in window)) return;
    items.forEach(function (el) { el.classList.add("will-reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* Count-up for [data-count] numbers */
  function initCounters() {
    var els = $all("[data-count]");
    if (!els.length) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function run(el) {
      var target = parseInt(el.getAttribute("data-count"), 10), start = null;
      if (reduce) { el.textContent = target; return; }
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / 900, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------------------
     Tabs (MECS stage explorer) — WAI-ARIA tabs pattern
  --------------------------------------------------------------------------- */
  function initTabs() {
    $all("[data-tabs]").forEach(function (wrap) {
      var tabs = $all('[role="tab"]', wrap);
      function select(tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute("aria-selected", on ? "true" : "false");
          t.tabIndex = on ? 0 : -1;
          doc.getElementById(t.getAttribute("aria-controls")).hidden = !on;
        });
        if (focus) tab.focus();
      }
      tabs.forEach(function (t, i) {
        t.addEventListener("click", function () { select(t); });
        t.addEventListener("keydown", function (e) {
          var n = null;
          if (e.key === "ArrowRight") n = tabs[(i + 1) % tabs.length];
          if (e.key === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
          if (e.key === "Home") n = tabs[0];
          if (e.key === "End") n = tabs[tabs.length - 1];
          if (n) { e.preventDefault(); select(n, true); }
        });
      });
      $all("[data-tab-next]", wrap).forEach(function (b) {
        b.addEventListener("click", function () {
          var t = doc.getElementById(b.getAttribute("data-tab-next"));
          if (t) select(t, true);
        });
      });
    });
  }

  /* ---------------------------------------------------------------------------
     Forms → email (FormSubmit AJAX). <form data-form data-subject="…">
  --------------------------------------------------------------------------- */
  function initForms() {
    var endpoint = SITE.formEndpoint || ("https://formsubmit.co/ajax/" + SITE.email);

    /* Pre-select the topic from ?topic=… (used by role buttons & CTAs). */
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get("topic");
    if (wanted) {
      $all("select[name=topic]").forEach(function (sel) {
        var found = $all("option", sel).some(function (o) { if (o.value === wanted) { o.selected = true; return true; } return false; });
        if (!found) { var o = doc.createElement("option"); o.value = o.textContent = wanted; o.selected = true; sel.appendChild(o); }
      });
    }

    $all("form[data-form]").forEach(function (form) {
      var status = form.querySelector(".form-status");
      var button = form.querySelector('[type="submit"]');
      var label = button ? button.innerHTML : "";

      function show(type, html, keepFocus) {
        status.className = "form-status form-status--" + type;
        status.innerHTML = html;
        status.hidden = false;
        if (!keepFocus) status.focus();
      }

      /* Group checkboxes need at least one ticked when marked data-required */
      function groupsValid() {
        var ok = true;
        $all("[data-required-group]", form).forEach(function (g) {
          var any = $all("input[type=checkbox]", g).some(function (c) { return c.checked; });
          g.classList.toggle("is-invalid", !any);
          if (!any) ok = false;
        });
        return ok;
      }

      form.addEventListener("change", function (e) {
        if (form.classList.contains("was-validated") && e.target.closest("[data-required-group]")) groupsValid();
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        form.classList.add("was-validated");
        if (!form.checkValidity() || !groupsValid()) {
          show("error", "Please fill in the highlighted fields.", true);
          var first = form.querySelector("input:invalid, select:invalid, textarea:invalid, .is-invalid input");
          if (first) first.focus();
          return;
        }
        var fd = new FormData(form), data = {};
        fd.forEach(function (v, k) { data[k] = data[k] ? data[k] + ", " + v : v; });
        if (data._honey) return; /* bot */
        data._subject = (form.getAttribute("data-subject") || "Website enquiry") + (data.topic ? " — " + data.topic : "") + (data.name ? " — " + data.name : "");
        data._template = "table";
        data._captcha = "false";
        data["Sent from"] = window.location.href.split("?")[0];

        button.disabled = true;
        button.innerHTML = "Sending…";
        status.hidden = true;

        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        })
          .then(function (res) { return res.json().catch(function () { return {}; }).then(function (j) { return { ok: res.ok, body: j }; }); })
          .then(function (r) {
            var success = r.ok && String(r.body.success) === "true";
            if (success) {
              form.reset();
              form.classList.remove("was-validated");
              show("success", "<strong>Message sent.</strong> Thanks — we've received it and will reply to the email you gave us.");
            } else {
              throw new Error(r.body && r.body.message ? r.body.message : "Send failed");
            }
          })
          .catch(function () {
            show("error", 'Sorry, the message couldn\'t be sent right now. Please email us directly at <a href="mailto:' + esc(SITE.email) + '">' + esc(SITE.email) + "</a>.");
          })
          .then(function () { button.disabled = false; button.innerHTML = label; });
      });
    });
  }

  /* ---------------------------------------------------------------------------
     Boot
  --------------------------------------------------------------------------- */
  doc.documentElement.classList.add("js");
  renderHeader();
  renderFooter();
  renderAll();
  initTheme();
  initNav();
  initTabs();
  initForms();
  initReveal();
  initCounters();
})();
