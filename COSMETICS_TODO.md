# Cosmetics TODO

Use this as the next focused cleanup list after the release mechanics are stable.

## Popup UI

- Check spacing and text wrapping in the popup at the current `560px` width
- Verify Help panel text in EN and RU
- Make sure date controls fit without horizontal overflow
- Review button labels for consistency: `Update`, `Copy selected`, `Copy text`, `Open`, `Refresh`

## Store Materials

- Create 3 to 5 screenshots for Chrome Web Store
- Create the required 440x280 small promo tile
- Replace support placeholders in `PRIVACY.md` and `CHROME_WEB_STORE.md`
- Finalize Chrome Web Store short and full descriptions

## Code Cleanup

- Keep `manifest.json` permissions minimal
- Avoid adding remote code or external runtime dependencies
- Keep release ZIPs out of git by leaving `dist/` ignored
- Before publishing, run `.\scripts\package-extension.ps1` and load the ZIP/unpacked folder manually in Chrome
