# Project Map

This file is the quick orientation point for the repository.

## Current Main Work Branch

- Final integration branch: `codex/chrome-webstore-prep`
- Published-store preparation commits are already on this branch
- Use this branch as the source for final review, cosmetics, packaging, and release work

## Important Folders

- `extension/` - the Chrome extension that gets packaged and uploaded
- `extension/icons/` - extension icon assets used by `manifest.json`
- `scripts/` - release helper scripts
- `dist/` - local generated ZIP output, ignored by git

## Important Files

- `extension/manifest.json` - Chrome extension metadata, permissions, version, content script config
- `extension/popup.html` - toolbar popup markup
- `extension/popup.css` - toolbar popup styles
- `extension/popup.js` - toolbar popup behavior
- `extension/content-script.js` - message bridge between popup and Astro.Expert pages
- `extension/parser-core.js` - chart parsing logic
- `extension/vimshottari.js` - Vimshottari and Ashtottari dasha tree logic
- `README.md` - short project overview
- `RELEASE.md` - version bump and packaging workflow
- `CHROME_WEB_STORE.md` - Chrome Web Store listing and review prep
- `PRIVACY.md` - privacy policy draft
- `REVIEWER_NOTES.md` - reviewer instructions for Chrome Web Store

## Release Commands

```powershell
.\scripts\bump-version.ps1 -Bump patch
.\scripts\package-extension.ps1
```

The ZIP appears in `dist/` and should be uploaded to Chrome Web Store.

## Branch Cleanup Guidance

Do not delete old branches until the final branch is pushed and verified.

Suggested final state:

- Keep `main`
- Keep `codex/chrome-webstore-prep` until merged
- Delete old local feature branches only after confirming their commits are included in `codex/chrome-webstore-prep`

Old branches currently look like historical feature steps, not active working branches:

- `ashtottari`
- `vimshottari-ui`
- `codex/vimshottari-extension-move`
- `codex/vimshottari-range-stability`
