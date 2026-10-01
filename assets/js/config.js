/* =============================================================================
   MATHATISED ESPORTS — SITE CONFIGURATION
   -----------------------------------------------------------------------------
   This is the ONE file to edit for links, email, forms, competitions,
   team members and open roles. Every page reads from here.
   ========================================================================== */

window.SITE = {
  name: "Mathatised Esports",
  tagline: "Building competitive platforms where players can compete, perform, and be seen.",
  pillars: ["Competition", "Growth", "Opportunity", "Recognition"],

  /* ---------------------------------------------------------------------------
     CONTACT
     `email` is shown on the site and used for mailto: links.
     Every on-site form (Contact, Host Your Event, Sponsorship) is delivered
     to `email` through FormSubmit (https://formsubmit.co) — no server or API
     key needed.
     IMPORTANT: the very first submission sends an "Activate Form" email to
     this inbox. Click it once and all future submissions are delivered.
     Optional: after activation FormSubmit gives you a random alias. Put
     "https://formsubmit.co/ajax/<alias>" in `formEndpoint` to keep the
     address out of the page source. Leave it empty to use `email`.
  --------------------------------------------------------------------------- */
  email: "mathatisedesports@gmail.com",
  formEndpoint: "",

  /* ---------------------------------------------------------------------------
     SOCIAL LINKS (order here = order of icons on the site)
  --------------------------------------------------------------------------- */
  socials: [
    { key: "discord",   label: "Discord",   url: "https://discord.gg/EbATfBadDv" },
    { key: "youtube",   label: "YouTube",   url: "https://www.youtube.com/@Mathatised" },
    { key: "twitch",    label: "Twitch",    url: "https://twitch.tv/mathatised" },
    { key: "tiktok",    label: "TikTok",    url: "https://www.tiktok.com/@mathatised.esports" },
    { key: "instagram", label: "Instagram", url: "https://www.instagram.com/mathatisedesports/" },
    { key: "facebook",  label: "Facebook",  url: "https://www.facebook.com/MathatisedEsports" }
  ],

  /* ---------------------------------------------------------------------------
     APPLICATION FORMS (Google Forms) — one per open role (see `roles` below).
     If a link is ever left empty, that role's button opens the on-site
     contact form with the role pre-selected instead, so no link is dead.
  --------------------------------------------------------------------------- */
  forms: {
    caster:              "https://forms.gle/8bPbAscxanyp86b26",
    matchAdmin:          "https://forms.gle/X1AtwqMQ2FNMRsAKA",
    tournamentAssistant: "https://forms.gle/6dCq2mY6kbLt3Q9BA",
    socialMediaManager:  "https://forms.gle/VLC8og4AKHaGxkfr5",
    videoEditor:         "https://forms.gle/LkLpSLoVTQkeAdCt9",
    graphicDesigner:     "https://forms.gle/SeEJgsEmhUpKaYsn7"
  },

  /* ---------------------------------------------------------------------------
     MECS TEAM REGISTRATION
     Every "Register Your Team" button uses this link. It points to Discord for
     now — paste a registration form link here when you have one.
  --------------------------------------------------------------------------- */
  registrationUrl: "https://discord.gg/EbATfBadDv",

  /* ---------------------------------------------------------------------------
     FEATURED VIDEO (Home page, "Matches are made to be watched")
     Any YouTube link works (youtu.be/…, youtube.com/watch?v=…).
  --------------------------------------------------------------------------- */
  featuredVideo: {
    url: "https://www.youtube.com/watch?v=g3ZCgIPvI9U",
    title: "SPL 2v2 Championship Grand Final: KL Banana vs Fury X BomX"
  },

  /* ---------------------------------------------------------------------------
     HOME HERO BACKGROUND VIDEO
     Put the video file(s) in assets/video/ and fill these in, e.g.
       mp4: "assets/video/hero.mp4"
     `mobile` is an optional smaller file for phones; without it, phones show
     the still image instead of the video (faster and saves their data).
     `poster` is the still shown while the video loads.
     Leave `mp4` empty to show the brand artwork instead of a video.
  --------------------------------------------------------------------------- */
  heroVideo: {
    mp4: "",
    webm: "",
    mobile: "",
    poster: ""
  },

  /* ---------------------------------------------------------------------------
     OFFICIAL DOCUMENTS (MECS page + footer). PDFs live in assets/docs/ and
     open in the browser's PDF viewer in a new tab.
  --------------------------------------------------------------------------- */
  docs: [
    { title: "MECS Rules & Regulations", file: "assets/docs/mecs-rules-and-regulations.pdf", meta: "PDF · 33 pages",
      text: "The official rulebook: eligibility, rosters, match procedures, disconnects, disputes and conduct." },
    { title: "MECS Format & Competition Structure", file: "assets/docs/mecs-format-and-competition-structure.pdf", meta: "PDF · 13 pages",
      text: "Every stage in detail: registration, groups, two-legged qualification, the Championship Bracket and seeding." }
  ],

  /* Regions shown where we talk about who can compete (everywhere except the SPL page). */
  openRegions: ["Asia", "The Middle East", "Europe", "Africa", "The Americas", "Oceania"],

  /* ---------------------------------------------------------------------------
     NAVIGATION
  --------------------------------------------------------------------------- */
  nav: [
    { page: "home",        label: "Home",        href: "index.html" },
    { page: "who-we-are",  label: "Who We Are",  href: "who-we-are.html" },
    { page: "competitions",label: "Competitions",href: "competitions.html" },
    { page: "mecs",        label: "MECS",        href: "mecs.html" },
    { page: "team",        label: "Team",        href: "team.html" },
    { page: "join-us",     label: "Join Us",     href: "join-us.html" },
    {
      label: "Partner",
      children: [
        { page: "host-your-event", label: "Host Your Event",  href: "host-your-event.html", text: "We build, run and broadcast it for you." },
        { page: "sponsor",         label: "Become a Sponsor", href: "sponsor.html",         text: "Put your brand where the competition is." }
      ]
    },
    { page: "contact",     label: "Contact",     href: "contact.html" }
  ],

  /* ---------------------------------------------------------------------------
     COMPETITIONS (shown on Home and Competitions pages)
     `game` and `prize` are optional — fill them in and they appear on the cards.
  --------------------------------------------------------------------------- */
  competitions: [
    {
      code: "MECS",
      name: "Mathatised Esports Championship Series",
      status: "current",
      statusLabel: "Current",
      logo: "assets/img/mecs-logo.webp",
      game: "Rocket League",
      description: "Our flagship championship series. A full competitive structure built so performances are seen, not buried in a bracket.",
      format: "24 teams · Group stage · Two-legged qualification · Double elimination",
      dates: "Four-week competition period",
      prize: "$150",
      result: "",
      href: "mecs.html"
    },
    {
      code: "SPL",
      name: "South Asia Premier League",
      status: "completed",
      statusLabel: "Completed",
      logo: "assets/img/spl-logo.webp",
      game: "",
      description: "One of our previous tournament initiatives: two double-elimination tournaments played across weekends with players from multiple regions.",
      format: "3v3 and 2v2 · 16 teams each · Double elimination · Middle East servers",
      dates: "29 August – 20 September",
      prize: "3v3: ~$150 · 2v2: $100",
      result: "3v3 Champion — Team Top Five · 2v2 Champion — FuryX BomX",
      href: "spl.html"
    }
  ],

  /* ---------------------------------------------------------------------------
     SPL DETAIL (SPL page)
  --------------------------------------------------------------------------- */
  spl: {
    tournaments: [
      {
        name: "SPL 3v3 Tournament",
        prize: "~$150",
        facts: ["16 participating teams", "Players from multiple regions around the world", "Middle East servers", "Double-elimination format", "Played across two weekends"],
        matchDays: ["29 August", "30 August", "5 September", "6 September"],
        placements: [
          { place: "1st", team: "Team Top Five" },
          { place: "2nd", team: "Team Pigeon Lovers" },
          { place: "3rd", team: "Team Revenant" }
        ]
      },
      {
        name: "SPL 2v2 Tournament",
        prize: "$100",
        facts: ["16 participating teams", "Players from multiple regions around the world", "Middle East servers", "Double-elimination format", "Played across two weekends"],
        matchDays: ["12 September", "13 September", "19 September", "20 September"],
        placements: [
          { place: "1st", team: "FuryX BomX" },
          { place: "2nd", team: "Kl Banana" },
          { place: "3rd", team: "UncsWhoDunc" }
        ]
      }
    ],
    /* SPL headline figures shown on the SPL page. Edit or add as needed. */
    stats: [
      { value: "50,000+", label: "Viewers tuned in" },
      { value: "100+",    label: "Players competed" },
      { value: "~$250",   label: "Total prize pool" }
    ]
  },

  /* Countries represented at the SPL (shown on the SPL page only; not an exhaustive list). */
  countries: ["Pakistan", "India", "Saudi Arabia", "Jordan", "Singapore", "Malaysia", "Australia"],

  /* ---------------------------------------------------------------------------
     TEAM (Team page)
     To add someone, copy a line and change it. Photos live in assets/img/team/
     (square images work best; assets/img/team-placeholder.svg is a spare
     placeholder). `tag` is the label on the photo. `socials` is optional — e.g.
       socials: [{ key: "twitch", url: "https://twitch.tv/name" }]
  --------------------------------------------------------------------------- */
  team: [
    { name: "Wali Hassan", role: "Head of Broadcast", tag: "Competition & Broadcast", bio: "Leads competition design, format structure, and the overall direction of Mathatised Esports events, while also overseeing broadcast production and stream operations.", region: "Pakistan", image: "assets/img/team/wali.webp", socials: [] },
    { name: "Yasar Amad", role: "Player Relations Manager", tag: "Player Relations", bio: "Oversees communication with players and teams, keeping information flowing smoothly throughout the tournament.", region: "Pakistan", image: "assets/img/team/yasar.webp", socials: [] },
    { name: "Ali Hassan", role: "Lead Caster", tag: "Play-by-Play", bio: "Calls play-by-play and analysis, turning matches into moments the audience remembers.", region: "Pakistan", image: "assets/img/team/ali.webp", socials: [] }
  ],

  /* ---------------------------------------------------------------------------
     OPEN ROLES (Team and Join Us pages), shown in this order.
     `form` points to a key in `forms` above. `needs` is a short list of
     what we look for (keep it to 2–3 points); `topic` is only used if the
     form link is ever empty.
  --------------------------------------------------------------------------- */
  roles: [
    { title: "Caster", icon: "mic", form: "caster", topic: "Caster application", cta: "Apply as a Caster",
      text: "The voice of our live broadcasts. Bring play-by-play excitement or deep analysis to tournament matches and showmatches.",
      needs: ["Clear microphone and a stable connection", "In-depth game knowledge", "High energy and vocal clarity on stream"] },
    { title: "Rocket League Match Admin & Referee", icon: "shield", form: "matchAdmin", topic: "Match Admin & Referee application", cta: "Apply as a Match Admin",
      text: "Oversee live matches, set up private lobbies, enforce the rules and make quick, fair calls that keep the event on track.",
      needs: ["Deep knowledge of Rocket League competitive rules", "Available during match timings", "Calm, clear decision-making"] },
    { title: "Tournament Assistant", icon: "users", form: "tournamentAssistant", topic: "Tournament Assistant application", cta: "Apply as a Tournament Assistant",
      text: "Be the point of contact for teams from registration to the final match, keeping players informed, supported and ready to compete.",
      needs: ["Strong communication and a player-first mindset", "Reliable on match days", "Comfortable with Discord and tournament workflows"] },
    { title: "Social Media Manager", icon: "share", form: "socialMediaManager", topic: "Social Media Manager application", cta: "Apply as Social Media Manager",
      text: "Drive engagement across TikTok, YouTube, Instagram and Discord, covering tournament action and connecting with fans.",
      needs: ["Strong written English and copywriting", "Up to date with esports trends", "Scheduling and working with designers and editors"] },
    { title: "Video Editor", icon: "video", form: "videoEditor", topic: "Video Editor application", cta: "Apply as a Video Editor",
      text: "Bring our content to life, from tournament highlight reels and hype trailers to short-form clips for Shorts, Reels and TikTok.",
      needs: ["CapCut, Premiere Pro, After Effects, DaVinci or similar", "A portfolio of gaming or esports edits", "Delivers on schedule"] },
    { title: "Graphic Designer", icon: "layers", form: "graphicDesigner", topic: "Graphic Designer application", cta: "Apply as a Graphic Designer",
      text: "Build our visual brand: broadcast assets, thumbnails, match cards, roster reveals and tournament graphics.",
      needs: ["Photoshop, Illustrator, Figma, Picsart or similar", "A feel for esports branding and typography", "Past thumbnail, banner or poster work"] }
  ],

  /* Topics offered in the Contact form's dropdown. */
  contactTopics: [
    "General enquiry",
    "Tournament or registration question",
    "Host an event with us",
    "Sponsorship or partnership",
    "Media or broadcast",
    "Joining the team",
    "Something else"
  ]
};
