# Callsign landing page

Plain HTML, CSS and JavaScript. No build step, no framework, no dependencies.

```
index.html          all the page copy and structure
styles.css          colours, type and layout
js/signs.js         the animated door signs in the gallery
js/duo.js           the 3D iPhone Duo mockup and its screens
js/screensaver.js   the bouncing "screen saver" sign
js/main.js          wiring: animation loop, scaling, hero carousel
```

## Preview locally

```bash
python3 -m http.server 8800
```

Then open http://localhost:8800. Opening `index.html` directly from Finder works too.

## Common edits

- **Copy:** edit the text in `index.html`. Each section has a `<!-- ==== Name -->` marker.
- **Colours and fonts:** the variables at the top of `styles.css`.
- **Hero carousel:** the `<button>`s under `hero-dots` in `index.html`. Each one sets the sign shown on the phone, the colour of the status dot and the caption.
- **Gallery signs:** each `<figure class="sign-card">` in `index.html`. `data-sign` picks the artwork and the caption holds the name and pack.
- **New sign artwork:** add a function to `SIGNS` in `js/signs.js`. It receives the current moment in the 30-second demo meeting (`f.inCall`, `f.q` for progress, `f.now` for the clock, and so on) and returns HTML for a 537×380 screen. Then use its name as `data-sign`.

## Deploying

GitHub Pages: Settings → Pages → Deploy from a branch, root folder. Any static host works the same way (Netlify, Vercel, Cloudflare Pages, S3): upload the whole folder.

## Before publishing

- **Hero photo:** save the desk photo as `images/hero-desk.jpg`, then follow the comment in the hero section of `index.html`.
- **App Store links:** the "Get the app" and "Download on the App Store" buttons are marked `TODO: App Store URL`.
- **Footer links:** Support, Privacy and Press kit still point to `#`.
