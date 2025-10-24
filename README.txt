The Finishing Touch – Landscape Product Catalog
================================================

This folder is a ready-to-publish static web app for GitHub Pages.
It uses plain HTML/CSS/JS (no build step), your bottle-green theme,
and includes sample products and your logo.

Quick Start (GitHub Pages)
-------------------------
1) Create a new repository on GitHub (Public), e.g. `finishingtouch-catalog`.
2) Click **Add file → Upload files** and upload the contents of this folder
   (the files inside, not the outer folder itself).
3) Commit the changes.
4) Go to **Settings → Pages**. Under **Source**, choose:
   - **Deploy from a branch**
   - **Branch:** `main`
   - **Folder:** `/ (root)`
   Then click **Save**.
5) Wait 1–3 minutes. Your site will be live at:
   https://YOUR-USERNAME.github.io/REPOSITORY-NAME

Editing Content
---------------
- Use the **Admin** button on the top-right to add/edit/delete products.
- All data saves to **your browser**. Use **Export CSV** to back it up.
- Use **Print / PDF** to export a printable catalog from your browser.
- Each product card has **Copy** (summary text) and **WhatsApp** share links.
- You can change the title, colors, footer contacts in `index.html` and `style.css`.

Colors
------
- Bottle Green: #0f3d2e
- Text: #0b0f0e

Files
-----
- `index.html`  – structure + header/footer + filters
- `style.css`   – bottle green & white theme
- `app.js`      – catalog logic, localStorage, sample products
- `assets/logo.png` – your logo
- `assets/*.svg` – lightweight sample images

Notes
-----
- Because this is static, product images you upload via Admin are stored as base64
  in your browser. For team sharing, consider hosting images in the repo's
  `assets/` folder and pasting their relative paths into the product image field in future.
- If you want CSV **import** or multi-image support, ask and we’ll extend it.