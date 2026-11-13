# Publish the portfolio repository

Repository: https://github.com/lalacbr11/offscript

Created by Laura; populated through the connected GitHub integration. The commands below are an alternative local setup, not steps to repeat on top of an existing checkout.

## Repository settings

- Name: offscript
- Description: A shared-phone date planner built with Figma Make, refined through manual desktop and iPhone QA.
- Homepage: https://inside-fall-14850174.figma.site
- Suggested topics: react, typescript, vite, figma-make, portfolio, manual-testing, usability, date-planner
- Start with an empty repository; upload this project's contents at its root, not inside an extra folder.
- Keep the existing source metadata and original pnpm lockfile. Do not include node_modules, dist, or local environment files.
- Do not add a blanket license without Laura's decision.

## Git commands for a local checkout

Create the empty repository under the correct GitHub account first. From this project's root:

```sh
git init -b main
git add .
git diff --cached --stat
git commit -m "Import submitted OffScript prototype and portfolio documentation"
git remote add origin https://github.com/lalacbr11/offscript.git
git push -u origin main
```

If the repository already exists, inspect it first rather than overwriting or force-pushing. Confirm the Actions run and live demo link after upload. Add the actual Handshake Showcase URL in README.md and docs/SUBMISSION.md. The docs/HANDOFFS.md file has focused review tasks for Andi and Dex.
