# Images

## Product screenshots (real Mogli demo app)

All product images are frames from a screen recording of the real Mogli demo app ("Mogli Demo Travels"), cleaned of the mouse cursor and hover tooltips. Overwrite any file with a new screenshot using the same name.

    assets/images/dashboard.webp              Home dashboard (1896 x 864)
    assets/images/dashboard-laptop.webp       Home dashboard inside the MacBook lid (1896 x 864, ratio 2.19; the lid height is 15.1rem in css)
    assets/images/tabs/travel-agencies.webp   Home
    assets/images/tabs/tour-operators.webp    Movement chart
    assets/images/tabs/sales-teams.webp       Profit report
    assets/images/tabs/operations-teams.webp  Rates & availability
    assets/images/stages/capture.webp         Leads list
    assets/images/stages/plan.webp            Booking detail
    assets/images/stages/book.webp            Bookings list
    assets/images/stages/collect.webp         Payment dashboard
    assets/images/ops/capture.webp            Email review      (1210 x 864 crop, ratio 1.4)
    assets/images/ops/itinerary.webp          Booking detail
    assets/images/ops/calendar.webp           Movement chart
    assets/images/ops/payments.webp           Proforma invoices
    assets/images/ops/reports.webp            MIS dashboard
    assets/images/solutions/*.webp            Solutions page panels (leads, quote=rates, suppliers=hotels, payments, documents=proforma, calendar=movement) (each 1896 x 864, full frame, shown whole) + results.webp (MIS cards on a green panel)

- The four tab previews and the four stage windows share one ratio (1896 x 864); `--tab-ar` in css is also read from the first tab image by `main.js`.
- Keep all frames in each group at the same ratio. Recommended: about 1900 px wide, WebP, quality 80 to 86.
- `assets/images/sky-clouds-green.webp` is the stages panel background (hue-shifted copy of `sky-clouds.webp`). Make sure you have the rights to it and to `travel-hero.webp`.
- Demo data visible in the screenshots (Daniel Fernandes, BK-0001...) is from the demo app.

## Customer logos (DEMO, replace with real customers' logos)

    assets/images/logos/*.webp   (8 invented brands: wanderline, skyroute, nomad, palm, trailhead, bluecompass, oasis, kestrel)

Transparent WebP, about 132 px tall at 2x (shown about 34 to 43 px tall), grey on transparent. If you change the file names or add logos, edit the two `<ul class="marquee__set">` lists in `index.html` (the second list is the aria-hidden copy that makes the loop seamless).

## Orbit photos (placeholders, replace with real travel photos)

    assets/images/orbit/orbit-01.webp ... orbit-12.webp

These twelve are simple illustrated placeholders. Overwrite them with real photos using the same names.
Any size works: each slot crops to its own ratio (landscape, portrait or square). About 800 to 1200 px wide, WebP, under 120 KB each.
Which file sits in which ring, and each photo's size and ratio, is set per item in `index.html` (`--k` = size, `--ar` = ratio).

## travel-hero.webp (hero background)

`main.js` switches from the built-in SVG hills to this photo automatically. It also appears behind the tab previews.
Replace it with your own or a properly licensed image before launch (portrait or near-square, about 1800 x 2000 px, WebP, under 400 KB).

    cwebp -q 82 your-photo.jpg -o travel-hero.webp


## Orbit photos (updated)

`assets/images/orbit/orbit-01..12.webp` are travel photos from the Unsplash download set you provided (cropped to each slot's ratio: 4:3, 3:4, 3:2 or 1:1; 720 to 960 px). Photos marked "premium" in that set (Unsplash+) were left out; check the Unsplash licence for the ones in use before launch.
