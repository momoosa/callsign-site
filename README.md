# Callsign landing page

`index.html` is self-contained: fonts, styles, scripts and animations are inlined, so it needs no build step and no other files.

## GitHub Pages
1. Create a repo (or use an existing one) and add `index.html` at the root, or in `/docs`.
2. Settings → Pages → Source: "Deploy from a branch", pick the branch and folder.
3. The site appears at `https://<user>.github.io/<repo>/`.

Any static host works the same way (Netlify, Vercel, Cloudflare Pages, S3): upload `index.html`.

## Before publishing
- The hero background photo slot is empty. Drop the photo into the design and re-export, or it shows as a grey placeholder.
- The "Download on the App Store" and "Get the app" buttons don't link anywhere yet. Add the App Store URL once the listing exists.
- Footer links (Support, Privacy, Press kit) point to `#`.
