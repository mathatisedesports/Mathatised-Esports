# Mathatised eSports — Website

Multi-page website for Mathatised eSports and the Mathatised eSports Championship Series (MECS).

It's a plain static site: HTML, CSS and vanilla JavaScript. There's **no build step and nothing to install**, so it runs on Vercel, GitHub Pages, Netlify or any static host.

---

## Deploy to Vercel (via GitHub)

1. Create a new GitHub repository and upload **the contents of this folder** (so `index.html` sits at the repo root).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. When Vercel asks for settings, use:
   - **Framework Preset:** `Other`
   - **Build Command:** leave empty
   - **Output Directory:** leave empty (the repo root)
4. Click **Deploy**.

`vercel.json` turns on clean URLs, so `/contact` serves `contact.html`. The custom `404.html` handles unknown paths.

### Right after your first deploy

1. **Activate the forms (one-time).** Submit any form on the live site once (for example, the Contact form). FormSubmit then emails an **"Activate Form"** link to `mathatisedesports@gmail.com`. Click it. Messages only start arriving after this step. Also check the spam folder.
2. **Social share image.** Social platforms need an absolute image URL. In each page's `<head>`, change
   `content="/assets/img/og-image.jpg"` to `content="https://YOUR-DOMAIN/assets/img/og-image.jpg"`.

---

## Where to edit things

Almost everything you'll want to change is in **`assets/js/config.js`**:

| What | Key in `config.js` |
|---|---|
| Contact email (shown on the site, mailto links, form delivery) | `email` |
| Social links (Discord, YouTube, Twitch, TikTok, Instagram, Facebook) | `socials` |
| Google Form links for applications | `forms` |
| Navigation menu | `nav` |
| Competition cards (MECS, SPL) — including an optional `game` field | `competitions` |
| SPL tournaments, match days, placements, stats | `spl` |
| Countries shown in "global participation" | `countries` |
| Team members (name, role, bio, photo, region, socials) | `team` |
| Open roles on Team / Join Us pages | `roles` |
| Contact form topics | `contactTopics` |
| Footer tagline ("Competition · Growth · Opportunity · Recognition") | `pillars` |

The header, footer, social icons, competition cards, team cards, role cards and SPL results are all generated from this file, so a change here updates every page.

Page text (headlines, section copy) lives in each `.html` file.

### Placeholders to replace

- **Google Forms:** in `forms`, replace `[CASTING_GOOGLE_FORM_URL]` and the other placeholders with real links. Until you do, each "Apply…" button opens the on-site contact form with the right topic pre-selected, so no button is ever dead.
- **Team members:** replace the `[Team Member Name]` entries in `team`. Put photos in `assets/img/team/` (square images work best) and point `image` at them.
- **SPL statistics:** add confirmed figures to `spl.stats`. While it's empty, the SPL page shows a clearly marked placeholder.
- **Game title:** add `game: "…"` to a competition and it appears on its card.
- **Broadcast artwork:** replace `assets/img/broadcast-placeholder.svg` with match footage or a thumbnail, and remove the caption in `index.html`.

---

## How the forms work

The Contact, Host Your Event and Sponsorship forms send email through [FormSubmit](https://formsubmit.co). It's a free service that forwards submissions to the address in `config.js`, with no server or API key needed.

- Each email arrives with a clear subject, such as `Mathatised website — Event enquiry — Host an event with us — Name`, and the fields laid out as a table.
- Replying to the email goes straight to the sender.
- A hidden honeypot field filters out basic spam bots.
- If a send fails, the visitor sees a message pointing them to the email address instead.
- **Optional privacy upgrade:** after activation, FormSubmit gives you a random alias. Set `formEndpoint: "https://formsubmit.co/ajax/YOUR_ALIAS"` in `config.js` so the address isn't visible in the page source.

---

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| Who We Are | `who-we-are.html` |
| Competitions | `competitions.html` |
| South Asia Premier League | `spl.html` |
| MECS | `mecs.html` |
| Team | `team.html` |
| Join Us | `join-us.html` |
| Host Your Event | `host-your-event.html` |
| Become a Sponsor | `sponsor.html` |
| Contact (with form) | `contact.html` |
| Not found | `404.html` |

## Project structure

```
├── *.html                 pages
├── vercel.json            clean URLs + security headers
├── robots.txt
└── assets/
    ├── css/styles.css     all styling (light + dark theme tokens at the top)
    ├── js/config.js       ← edit links, email, forms, content data here
    ├── js/site.js         shared header/footer/components + interactions
    └── img/               logos, favicons, share image, placeholders
```

## Previewing locally

Pages load their shared header and footer with JavaScript, so open the site through a local server rather than double-clicking the files. For example, with Node installed:

```
npx serve .
```

Or with Python: `python -m http.server`, then open http://localhost:8000.

## Features

- Light theme by default, with an optional dark mode toggle (the visitor's choice is remembered)
- Responsive from 320px phones up to wide desktops; hamburger menu below 1180px
- Interactive MECS stage explorer (keyboard accessible, with arrow keys)
- Subtle scroll-reveal animations, turned off for visitors who prefer reduced motion
- Page titles and meta descriptions on every page, semantic HTML, alt text, visible focus states, and a skip link
