# Setup On New PC

## Purpose

This file is a practical checklist for restoring the working environment for this project on another computer.

It does not automatically clone the full Codex environment, but it gives a step-by-step setup sequence.

## 1. Install Base Tools

Install:

- Codex app
- Git
- GitHub Desktop (optional, but convenient)
- Google Chrome or Microsoft Edge

Recommended:

- Node.js
- ripgrep

## 2. Clone The Repository

Clone the repository from GitHub:

`parsing-astroexpert`

If using GitHub Desktop:

1. Sign in to the same GitHub account.
2. Clone the repository.
3. Open the repository locally.

If using git:

```powershell
git clone https://github.com/denisflock-stack/parsing-astroexpert.git
cd parsing-astroexpert
```

## 3. Switch To The Working Branch

The current working branch for Vimshottari work is:

`vimshottari-ui`

In GitHub Desktop:

1. Open the branch selector.
2. Choose `vimshottari-ui`.

In git:

```powershell
git checkout vimshottari-ui
```

## 4. Restore Local Secrets

Local secrets are not stored in GitHub.

Recreate local environment files if needed:

- `.env.local`

Expected values may include:

```env
ASTRO_EXPERT_LOGIN=...
ASTRO_EXPERT_PASSWORD=...
```

## 5. Codex Notes

GitHub transfers the project code, but not the full live Codex session state.

On the new PC, after opening the repo in Codex, give Codex the following context:

- current branch: `vimshottari-ui`
- main file for current work: `vimshottari_dasha`
- for the current stage, work is focused on `vimshottari_dasha`
- do not touch `extension/` unless explicitly agreed

## 6. MCP / Tooling Notes

Recheck the following on the new PC:

- browser automation access works
- Playwright/browser tools are available in Codex
- GitHub integration works if needed

If MCP servers are configured locally on the machine, they may need to be re-enabled or reconnected manually.

## 7. Browser Testing

For this project, browser access is part of the workflow.

Prepare:

- logged-in access to `astro.expert`
- a browser window for live testing
- the target Vimshottari page if needed

## 8. Current Working Rule

Current temporary working rule for this stage:

- develop in `vimshottari_dasha`
- do not edit `extension/` during this stage unless explicitly decided

## 9. Backup Workflow

When you want to save progress:

1. Commit changes in the current branch.
2. Push the branch to GitHub.

In GitHub Desktop:

1. Enter a short commit summary.
2. Commit to the current branch.
3. Push / Publish branch.

## 10. Quick Start Checklist

Use this short sequence on a new PC:

1. Install Codex.
2. Install GitHub Desktop or Git.
3. Clone `parsing-astroexpert`.
4. Switch to `vimshottari-ui`.
5. Restore `.env.local`.
6. Open the repo in Codex.
7. Open Chrome or Edge.
8. Log in to `astro.expert`.
9. Continue work in `vimshottari_dasha`.
