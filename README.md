# Mathatised Esports — Website

Multi-page website for Mathatised Esports and the Mathatised Esports Championship Series (MECS).

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
2. **Link previews.** Each page's `<head>` points its share image, `og:url` and canonical link at `https://mathatised-esports.vercel.app`. If you move to a custom domain, find-and-replace that address in all `.html` files.

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

### Homepage background video

1. Put the file in `assets/video/` (for example, `assets/video/hero.mp4`).
2. In `config.js`, set `heroVideo.mp4` to that path. Optionally, also set `poster` to a still image and `mobile` to a smaller file for phones.

Recommended file: MP4 (H.264), 1920×1080, 10–20 seconds, loops cleanly, no audio, **under 6 MB**. Without a `mobile` file, phones show the still artwork instead, which keeps the page fast on mobile data.

### Official documents

The MECS rulebook and format guide live in `assets/docs/` and are listed under `docs` in `config.js`. To update one, replace the PDF using the same filename. They open in the browser's PDF viewer.

### Placeholders to replace

- **Open roles:** each role in `roles` points to a Google Form link in `forms`. To add a role, add a form link and a matching entry in `roles`. To close a role, delete its entry. If a form link is ever left empty, that role's button falls back to the contact form.
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
