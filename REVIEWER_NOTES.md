# Reviewer Notes

Last updated: April 11, 2026

## Extension purpose

Astro.Expert Chart Parser works only on `https://*.astro.expert/*` pages.

It reads chart data already visible on the current Astro.Expert page and shows it in the extension popup. It also supports working with visible Vimshottari and Ashtottari dasha trees on supported Astro.Expert pages.

## How to verify

1. Open a supported chart page on `https://astro.expert`
2. Click the extension icon in the Chrome toolbar
3. In chart mode, click `Update` to parse the current page
4. Confirm that parsed chart blocks appear in the popup
5. Select one or more chart blocks and click `Copy selected`

## Dasha mode

If the current Astro.Expert page URL contains `vimshottari` or `ashtottari`, the popup switches to dasha mode automatically.

In dasha mode, the reviewer can:

- Refresh the visible dasha tree
- Mark or unmark branches
- Open a branch by clicking its title or date range
- Copy exported dasha text

## Data handling

- The extension processes page data locally in the browser
- No remote server transmission is used by the extension code in this repository
- The only local stored value is the selected UI language preference

## Notes

- If Astro.Expert requires authentication for review, publisher-provided test access may be needed
