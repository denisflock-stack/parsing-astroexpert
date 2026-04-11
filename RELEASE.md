# Release Process

## Versioning

This project uses the Chrome extension version from `extension/manifest.json`.

- `patch`: bug fixes, small internal updates
- `minor`: new backward-compatible features
- `major`: breaking changes or major behavior changes

## Bump version

From the repository root, run one of:

```powershell
.\scripts\bump-version.ps1 -Bump patch
.\scripts\bump-version.ps1 -Bump minor
.\scripts\bump-version.ps1 -Bump major
```

This updates the `version` field in `extension/manifest.json`.

## Build release ZIP

```powershell
.\scripts\package-extension.ps1
```

Default output:

- `dist/astro-expert-chart-parser-<version>.zip`

## Publish update

1. Make and test the code changes
2. Bump the version in `extension/manifest.json`
3. Build the ZIP with `.\scripts\package-extension.ps1`
4. Upload the ZIP to Chrome Web Store Developer Dashboard
5. Submit the update for review
6. After approval, Chrome will roll out the update to users automatically

## Recommended release checklist

- Verify popup parsing on a supported Astro.Expert chart page
- Verify Vimshottari or Ashtottari mode if affected by the change
- Confirm `extension/manifest.json` version was increased
- Confirm the ZIP contains the contents of `extension`, not the repo root
- Update listing text, privacy details, or reviewer notes if behavior changed
