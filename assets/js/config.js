/* =============================================================================
   MATHATISED ESPORTS — SITE CONFIGURATION
   -----------------------------------------------------------------------------
   This is the ONE file to edit for links, email, forms, competitions,
   team members and open roles. Every page reads from here.
   ========================================================================== */

window.SITE = {
  name: "Mathatised eSports",
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
     APPLICATION FORMS (Google Forms)
     Replace each [PLACEHOLDER] with the real Google Form link.
     Until a real link is added, the button safely opens the on-site
     contact form with the matching topic pre-selected — so no link is dead.
  --------------------------------------------------------------------------- */
  forms: {
    casting:           "[CASTING_GOOGLE_FORM_URL]",
    socialMedia:       "[SOCIAL_MEDIA_GOOGLE_FORM_URL]",
    discordModeration: "[DISCORD_MODERATION_GOOGLE_FORM_URL]",
    general:           "[GENERAL_APPLICATION_GOOGLE_FORM_URL]"
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
    url: "https://youtu.be/6JJDFMlr3z0",
    title: "SPL Championship 3v3 Grand Final: Team Pigeon Lovers vs Team Top Five"
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
     `game` is optional — add the game title and it appears on the cards.
  --------------------------------------------------------------------------- */
  competitions: [
    {
      code: "MECS",
      name: "Mathatised eSports Championship Series",
      status: "current",
      statusLabel: "Current",
      logo: "assets/img/mecs-logo.webp",
      game: "Rocket League",
      description: "Our flagship championship series. A full competitive structure built so performances are seen, not buried in a bracket.",
      format: "32 teams · Group stage · Two-legged qualification · Double elimination",
      dates: "Six-week competitive cycle",
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
      { value: "$250+",   label: "Prize pool awarded" }
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
    { name: "Wali Hassan", role: "Head of Broadcast", tag: "Competition & Broadcast", bio: "Leads competition design, format structure, and the overall direction of Mathatised eSports events, while also overseeing broadcast production and stream operations.", region: "Pakistan", image: "assets/img/team/wali.webp", socials: [] },
    { name: "Yasar Amad", role: "Player Relations Manager", tag: "Player Relations", bio: "Oversees communication with players and teams, keeping information flowing smoothly throughout the tournament.", region: "Pakistan", image: "assets/img/team/yasar.webp", socials: [] },
    { name: "Ali Hassan", role: "Lead Caster", tag: "Play-by-Play", bio: "Calls play-by-play and analysis, turning matches into moments the audience remembers.", region: "Pakistan", image: "assets/img/team/ali.webp", socials: [] }
  ],

  /* ---------------------------------------------------------------------------
     OPEN ROLES (Team and Join Us pages). Casting stays first.
     `form` points to a key in `forms` above; `topic` is used for the
     contact-form fallback while the Google Form link is still a placeholder.
  --------------------------------------------------------------------------- */
  roles: [
    { title: "Casting", icon: "mic", form: "casting", topic: "Casting application", cta: "Apply for Casting",
      text: "For people interested in esports commentary, play-by-play, analysis, and bringing matches to life." },
    { title: "Social Media", icon: "share", form: "socialMedia", topic: "Social media application", cta: "Apply for Social Media",
      text: "For people interested in content, social strategy, posts, community engagement, and esports media." },
    { title: "Discord Moderation", icon: "shield", form: "discordModeration", topic: "Discord moderation application", cta: "Apply for Discord Moderation",
      text: "For people interested in helping maintain and grow the Mathatised eSports Discord community." },
    { title: "Additional & General Roles", icon: "sparkle", form: "general", topic: "General application", cta: "Apply to Join",
      text: "Design, observing, statistics, editing or something we haven't listed yet — tell us what you can bring." }
  ],

  /* Topics offered in the Contact form's dropdown. */
  contactTopics: [
    "General enquiry",
    "Tournament or registration question",
    "Host an event with us",
    "Sponsorship or partnership",
    "Media or broadcast",
    "Casting application",
    "Social media application",
    "Discord moderation application",
    "General application",
    "Something else"
  ]
};
