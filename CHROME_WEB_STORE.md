# Chrome Web Store Prep

Last updated: April 11, 2026

This repository is prepared for publishing the extension from the `extension` folder.

## Packaging

1. Create the release ZIP from the contents of `extension`, not from the repository root.
2. Upload that ZIP in the Chrome Web Store Developer Dashboard.

## What is already aligned

- Manifest V3 is used.
- Host access is limited to `https://*.astro.expert/*`.
- The manifest description matches the current feature set more closely.
- No remote hosted code is used by the extension code in this repository.
- A privacy policy draft is included in `PRIVACY.md`.

## Store listing assets to prepare

- Extension icon: 128x128
- At least 1 screenshot, preferably 3 to 5
- Small promo tile: 440x280

## Privacy form notes

Suggested disclosure based on the current code:

- Single purpose: parse Astro.Expert chart pages and dasha trees for the user
- Data handled: page content provided by Astro.Expert, including chart and birth details visible on the page
- Data transmission: none detected in the current extension code
- Data storage: only local UI language preference in Chrome storage
- Remote code: none

## Reviewer notes to prepare

- Explain that the extension works only on Astro.Expert pages
- Describe how to open a supported chart page and then open the toolbar popup
- If Astro.Expert requires sign-in for review, provide test credentials or clear review steps

## Recommended listing copy

### Short description

Parse Astro.Expert chart pages and copy chart or dasha data from a popup.

### Full description

Astro.Expert Chart Parser helps you work with Astro.Expert pages directly in Chrome.

- Parse supported chart pages from the toolbar popup
- View chart data in a compact popup UI
- Copy selected chart sections
- Work with Vimshottari and Ashtottari dasha trees
- Open, mark, and export visible dasha branches
- Keep a local EN or RU interface preference

The extension works only on `https://*.astro.expert/*` pages and processes page data locally in the browser.
