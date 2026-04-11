# parsing-astroexpert

Astro.Expert parser is packaged in this repository as a Chrome extension based on Manifest V3.

## Features

- Parses supported Astro.Expert chart pages from the active browser tab
- Shows chart header details in the popup, including chart name and available birth details
- Lists parsed chart blocks and allows copying selected sections
- Supports working with Vimshottari and Ashtottari dasha trees
- Lets the user open, mark, navigate, and export visible dasha branches
- Stores only the local EN or RU UI language preference

## Structure

- `extension/manifest.json` - extension manifest
- `extension/parser-core.js` - Astro.Expert page parsing logic
- `extension/content-script.js` - message bridge between popup and page
- `extension/popup.html`, `extension/popup.css`, `extension/popup.js` - toolbar popup UI
- `extension/vimshottari.js` - Vimshottari and Ashtottari tree support

## Local install

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click Load unpacked
4. Select the `extension` folder from this repository
5. Open a supported page on `https://astro.expert`
6. Click the extension icon in the Chrome toolbar

## Publishing notes

- Package the contents of the `extension` folder as the release ZIP
- Review `PRIVACY.md` before publication and add your final publisher contact details
- Review `CHROME_WEB_STORE.md` for listing, privacy, and reviewer preparation notes
- Use `RELEASE.md` and the scripts in `scripts/` for version bumps and release packaging
