# Mogli landing page

Open `index.html` in a browser (or serve the folder with any static server).

- `index.html`, `css/style.css`, `js/main.js`: HTML5, Bootstrap 5, vanilla JS, GSAP 3 + ScrollTrigger (CDN).
- Theme: light only. All design tokens live in `:root` at the top of `css/style.css`; the semantic colours used by the page (`--page`, `--text`, `--line`, ...) are mapped from them in section 3.
- Font: ABC Diatype Light in `assets/fonts/diatype-light.woff2`. It is a single-weight font, so hierarchy comes from size and colour. A web licence from ABC Dinamo is required for production.
- Timings: see `CONFIG` at the top of `js/main.js`.

## Sections

1. Hero: headline, slim rotating statement (six phrases, edit them in `index.html` under `.statement-stack`), description, CTAs.
2. MacBook scroll (`#showcase`, now a `<div class="showcase mac2">` inside `<section class="hero">`): a port of the Aceternity "MacBook Scroll" component, same sizes (32rem lid, 22rem base) and the same scroll keyframes. Over the section's scroll progress the screen scales 1.2 x 0.6 to 1.5 x 1.5, rotates from -28 deg to flat and slides down until, at the end of the scroll (section bottom = viewport bottom), the whole enlarged screen rests fully visible and centred under the nav (the distance is computed in `travel()` in `initMac`). The screen shows `assets/images/dashboard-laptop.webp` (real Mogli Home screenshot, 1896 x 864; lid height 15.1rem). Code: `initMac` in `js/main.js`, `.mac2*` and `.kb*` in `css/style.css`; the keyboard is plain HTML. With reduced motion or without GSAP only the open screen is shown.
3. Platform tabs (`#platform`): Travel Agencies / Tour Operators / Sales Teams / Operations Teams.
   Scroll-driven: on screens at least 992 px wide and 720 px tall the tab block (`#platformRail`) becomes a sticky runway and scrolling through it switches the tab; clicking a tab scrolls to its slice (`initPlatformRail`, `createRail`). On smaller screens or without motion the tabs are plain click controls.
   Each tab key (`agencies`, `operators`, `sales`, `operations`) links one `.ptab` button, one `.pshot` image and one `.pfeatures__set` block via `data-tab` / `data-shot` / `data-set`.
4. Tools bento (`#tools`): headline, four role chips (Sales / Planning / Operations / Accounts) that swap the copy and the "Steps" mock in the big card (`data-variant`), then a 2 card row (Collaboration, Workflows) and a 3 card row (Records, Suppliers, Reports). The mock UIs are plain HTML/CSS placeholders: edit the text in `index.html`. Each card animates once when it scrolls in (`initTools` in `js/main.js`).
5. Sky stages (`#stages`): cloud-sky panel (`assets/images/sky-clouds.webp`), pill tabs Capture / Plan / Book / Collect with a sliding white thumb, a headline + CTA per stage and a dark browser window showing `assets/images/stages/<stage>.webp`. It auto-rotates every 6.5 s while visible (stops after the first click or hover). See `initSky` in `js/main.js`.
6. Hub (`#hub`): "One software for every part of your travel business". Centre Mogli logo with 15 connected modules around it (lines draw in, dots travel along them). Node positions are `--x` / `--y` (percent) in `index.html`; the matching line ends are in the SVG above them (viewBox 1200 x 560). On phones it becomes a simple grid.
7. Operations cards (`#ops`): five horizontal expanding cards (Enquiry Capture, Itinerary Builder, Tour Movement Calendar, Payment Tracking, Reports). Preview images are `assets/images/ops/*.webp` (placeholders).
   Scroll-driven switching: on screens at least 992 px wide and 720 px tall the section becomes a tall runway with a sticky stage (`.rail.is-rail`), and scrolling through it opens the cards one after another. Clicking any card opens it and scrolls to its slice. The runway length is `--rail-n` x 42vh (`.rail.is-rail` in `css/style.css`). On phones the cards stack as an accordion; with reduced motion or without GSAP they are plain click controls. Code: `createRail`, `initOps`, `initHub` in `js/main.js`.
8. Trust (`#trust`, **demo content**): logo marquee, four count-up numbers and three testimonials. The 8 logos are invented brands in `assets/images/logos/*.webp` (transparent, 132 px tall); the numbers (`data-count`, `data-decimals`, `data-suffix`) and quotes are placeholders too. Replace them with real customers, real figures and permissioned quotes before launch. The marquee loops with CSS alone; with GSAP it speeds up while you scroll (`initTrust`). With reduced motion it becomes a static wrap of logos.
9. Orbit (`#orbit`): the Mogli logo in the centre with two rings of photos revolving behind it. Speeds, radii and depth are set in `ORBIT` / `initOrbit` in `js/main.js`; ring speed is `data-loop` (seconds per turn) in `index.html`.
10. Benefits, FAQ (`#faq`, **demo content**, five questions, one open at a time, `initFaq`), CTA band, footer.

## Scroll animations (all in `js/main.js`)

- Scroll progress bar (top of the page, `.scroll-progress`).
- Headings slide up word by word (`splitHeadings`, list of headings in `SPLIT_SELECTOR`); the heading keeps an `aria-label` with its full text.
- Hero content drifts up and softens as you leave the hero; the platform browser frame rises and settles; the dashboard rises with a 3D tilt that flattens.
- Logo marquee with scroll-velocity boost, count-up numbers, staggered testimonials (middle card drifts on desktop), staggered FAQ rows, CTA band scale-in.
- Existing: scene parallax, sticky "rail" for the ops cards, hub lines, bento and sky entrances, orbit.
- Reduced motion: no split headings, no progress bar, no scrubbing; everything is shown in its final state. Without GSAP the page is fully readable and the FAQ still works.

## Images

Product images are real screenshots from the Mogli demo app (see `assets/images/README.md` for which screen is used where). Keep the same file names when you swap them.


## Solutions pages (`solutions-for/<slug>/index.html`)

Six solution pages share one layout, one stylesheet pair (`css/solutions.css` + `css/system.css`) and `js/solutions.js`:

| URL | Page |
|---|---|
| `/solutions-for/dmcs/` | DMCs (the original page, moved here) |
| `/solutions-for/international-inbound-tour-operators/` | International Inbound Tour Operators |
| `/solutions-for/outbound-tour-operators/` | Outbound Tour Operators |
| `/solutions-for/b2b-hotel-consolidators/` | B2B Hotel Consolidators |
| `/solutions-for/global-travel-agents/` | Global Travel Agents |
| `/solutions-for/hospitality-industry/` | Hospitality Industry |

`solutions-dmcs.html` is now only a redirect to `/solutions-for/dmcs/` so old links keep working.

Sections on every page: hero, "Daily struggles" pastel card row, six zig-zag feature blocks with real Mogli screenshots, old way vs Mogli way, "Everything you get" grid, links to three related solutions, FAQ, final CTA, footer. The DMCs page also keeps its demo-only sections (logo marquee, results figures, testimonial, country chips); the five new pages deliberately leave those out because they would be invented numbers.

Copy follows the topics of the Sembark solution pages but is rewritten for Mogli and limited to features visible in the product screenshots. Pages use folder URLs, so serve the folder with any static web server (opened straight from disk, a small helper in the JS files points folder links at `index.html`).

**Solutions mega menu**: the "Solutions" nav item opens a two-column menu ("Who we work with" with the six pages, "What we solve for" linking to the DMCs page sections `#z-leads`, `#z-quote`, `#z-suppliers`, `#z-payments`). Markup is repeated in each page's nav; CSS is in `css/nav.css`.

Screenshots live in `assets/images/solutions/` (1896 x 864 WebP, green-tinted): leads, quote, suppliers, payments, documents, calendar, email, activities, checkins, ledger, mis, profit, booking, bookings, channels, followups, sharedep, results. Swap them with the same file names.

DEMO content still to replace on the DMCs page: logo marquee (assets/images/logos), the four percentage figures, the testimonial, the country chips; and the "#" placeholder links (Pricing, About, Contact, Terms, Book a Demo).


## Privacy Policy and shared footer (latest changes)

- **Images**: blue or purple images (dashboard screenshots, sky clouds, solutions panels, blog covers, orbit photos) are hue-shifted to green and saved at high quality. The hero photo `travel-hero.webp` is the original. The colour pattern of the index page stays as before; the solutions and privacy pages use light greens instead of blue/purple.
- **Hero laptop**: the screen now grows up to 2.1x (limited by the viewport) at the end of the scroll, see `endScale()` in `initMac`; `will-change` was removed from `.mac2__screen` so the screenshot is re-rendered sharp at the final size.
- **Footer**: one shared footer (`.site-footer`) now sits on `index.html`, `privacy-policy.html` and every solutions page with the same four columns and a Privacy Policy link. Edit it in every page if you change a link.
- **Navigation**: the same nav markup is used on all three pages. On sub pages the links point to `index.html#...` so they work from anywhere.
- **Privacy Policy** (`privacy-policy.html`, `css/legal.css`, `js/legal.js`): the Mogli CRM Privacy Policy text supplied by you (9 sections incl. account/data deletion steps and a "what is deleted and kept" table, sticky contents list). Contact address: developer@anantavya.com.


## Feature pages (`features/<slug>/index.html`)

Sixteen feature pages, one per entry of the Features menu: auto-lead-capture, auto-lead-distribution, follow-ups-and-reminders, real-time-reports, smart-itinerary-builder, pricing-and-markup, smart-tour-calendar, check-in-check-out-reports, shared-departures, real-time-payment-tracking, proforma-invoice, suppliers-ledger, bulk-rate-import, smart-price-handling, channel-management, user-management-and-roles. Every page uses the same hero as the solutions pages (`.sol-hero`), then a screenshot showcase, a light mint "problem" band with white cards, sticky how-it-works steps, a bento of feature tiles, a with/without table, FAQ, three related features and the final CTA. Auto Lead Capture also has a sources-to-one-list diagram. All colours are light (mint / white / paper); no dark green blocks. Files: `css/feature.css` (scoped to `.feat`), `js/feature.js` (highlights the current step), crops of real screenshots in `assets/images/features/`. Copy only describes what the screenshots show; there are no invented figures. User Management & Roles has no dedicated screenshot, so it reuses the lead list and MIS views that show team members and roles. **Features menu**: a three-column mega menu (CRM & Sales, Itinerary, Booking and Payments, Supplier, Administration) sits between Solutions and Resources on every page, and the footer has a two-column Features list in place of the old Product column. Both are plain repeated markup; menu CSS is in `css/nav.css` (`.mega--3`), footer CSS in `css/style.css` (`.site-footer__features`). To add a feature page, copy a folder, edit its content and add it to the menu and footer.

Copy is rewritten from the Sembark page and limited to what the Mogli screenshots show (lead sources, Add lead, email review, unassigned flag, list/board, stage counts). No invented stats.


## Navigation (`css/nav.css`, loaded last on every page)

One file owns the nav bar, the Product dropdown and the Solutions mega menu, with one theme on every page: white over the index hero photo until you scroll, dark ink everywhere else (scrolled index, solutions, privacy), same frosted white bar, same green Get Started button, same white dropdown card, same mobile card. Structure (grid, hamburger, collapse) stays in `css/style.css`.


## Design system (`css/system.css`, loaded after style.css)

One shared layer owns brand tokens and component rules so the three pages stay consistent. Page stylesheets keep layout and animation.

- **Palette**: mint `--brand-mint #dcfab6`, forest ink `--ink #0c2219`, primary CTA green `--cta #0f3d27` (white text 12.9:1), accent green `--green #1f7a3a` (5.4:1 on white), off-white `--paper #f6f8f2`. The old blue accent (`--color-blue-500`) now resolves to brand green, so any rule that still reads it is green.
- **Scale**: `--fs-h1/h2/h3/lead`, `--section-y` (section rhythm), `--head-gap`, `--container-w`, `--radius-card/-lg/-sm`, `--shadow-card/-shot`, `--btn-h`. Change them once, every section follows.
- **Nav**: white-on-photo on `index.html` until scrolled; on the light pages (`body.sol`) it is dark ink on the pale hero and becomes the frosted white bar after 12 px of scroll (`is-scrolled`, toggled in `js/solutions.js` / `js/legal.js`).
- **Screenshots**: always shown whole with a hairline border and one restrained shadow. `assets/images/sky-clouds-green.webp` is the green stages background; `assets/images/hero-bg.webp` (17 KB, was a 1.4 MB PNG) is the solutions hero.
- **Links**: "Resources" now goes to the blog section (`index.html#blog`). Still `#` placeholders (marked `data-placeholder-link`, they do nothing): Pricing, About, Contact, Terms, Inbound/Outbound/Travel agents, the blog post titles and the "Book a Demo" buttons in the CTA band. Give each a real URL.
- **Demo content that must be replaced before launch**: the logo marquees, the trust numbers, the testimonials and the FAQ answers (see sections above).


## Update: green palette, footer, new pages

- **Colours**: the palette is now the doodle version's greens. Tokens are in `css/system.css` (`--lime` #c8f227 for primary buttons with `--on-lime` text, `--cta` #26541c for dark surfaces, `--green` #36731a for small accents, mint tints from the lime). Pastel card colours on the solutions pages keep their pink/yellow/mint mix.
- **Footer**: same footer as the doodle version (grass tint, hand-lettered headings, dashed rule, "safe travels"), without the hill and van on top. Caveat font: `assets/fonts/caveat-latin-700-normal.woff2` (footer only).
- **New pages** (all use the same nav and footer; styles in `css/pages.css`, form script in `js/pages.js`):
  - `pricing.html`: no prices are published; six company-type cards say "Pricing on request" and link to the contact form (`?topic=pricing&team=<slug>`). Add real plans/prices when you have them.
  - `contact.html`: form that validates and opens the visitor's mail app (`mailto:developer@anantavya.com`, the address from the privacy policy); nothing is sent from the page. Supports `?topic=demo|pricing` and `?team=<slug>`.
  - `about.html`: only wording already on the site (four stages, six solutions, privacy facts). No company story is invented.
  - `terms.html`: plain-language DRAFT built from the privacy policy's statements. Items marked "to be confirmed" (billing, notice periods, liability, governing law) need your legal advisor.
- Nav "Pricing", "Book a Demo" and "Get Started" now go to these pages. Still `#` placeholders: dropdown toggles, blog post links. On the home page several secondary buttons still point to `#demo` (there is no such section there).
