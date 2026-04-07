# Project Context

## Purpose

This file stores the shared working context for this project so that work can continue across:

- different Codex chats
- different computers
- interruptions between sessions

Use this file as the first source of project-specific rules before continuing work.

## Current Focus

Current active area:

- `vimshottari_dasha`

Current goal:

- develop and stabilize Vimshottari Dasha parsing and UI behavior in `vimshottari_dasha`
- only after stabilization, transfer working logic into the extension

## Current Branch

Current working branch:

- `vimshottari-ui`

## Working Rules

Current temporary rules for this stage:

- work only in `vimshottari_dasha`
- do not modify `extension/` unless explicitly agreed by the user
- use `vimshottari_dasha` as the main development sandbox
- use the browser/live page to verify behavior
- move logic into the extension only after it is stable

## Current Workflow

Preferred workflow:

1. Develop and debug logic in `vimshottari_dasha`
2. Verify on the live Astro.Expert page
3. Only then move proven logic into extension files

## Vimshottari Notes

Important current understanding:

- Vimshottari tree is dynamic and loads deeper levels after user clicks
- the user wants the tree to preserve structure correctly
- JSON/export should include only branches marked by checkboxes
- visible UI may include branches currently opened on the page even if they are not marked
- the project has explored both DOM-driven and formula-driven structure ideas
- the formula-driven experiment was rolled back
- current state should be treated as the pre-schema version unless explicitly changed again

## What Not To Assume

Do not assume:

- that `extension/` should be updated during this stage
- that a large architecture rewrite is desired without explicit agreement
- that previous experimental structure logic should be reintroduced automatically

## Key Files

Primary file for current work:

- `vimshottari_dasha`

Reference/setup files:

- `SETUP_NEW_PC.md`
- `README.md`

## Git / Backup Notes

GitHub is used for:

- backup
- moving work to another PC

Current branch published to GitHub:

- `vimshottari-ui`

## How To Resume In A New Chat

Recommended short prompt for a new Codex chat:

`Read PROJECT_CONTEXT.md first. We are currently working only in vimshottari_dasha on branch vimshottari-ui. Do not touch extension/ unless I explicitly ask.`
