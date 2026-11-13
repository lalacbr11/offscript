# Portfolio packaging verification

Date: November 13, 2026. Executed in a Linux workspace with Node 24.22.1 and npm 11.9.0. This verifies the supplied exported source and documents; it is not another manual browser regression.

| Check | Result |
|---|---|
| Import original ZIP and compare original-file SHA-256 values | Pass: all original files unchanged |
| Install dependencies with `npm install --ignore-scripts --no-audit --no-fund` | Pass: 50 packages installed |
| `npm run build` | Pass: 17 modules transformed; production output generated |
| `./node_modules/.bin/tsc --noEmit` | Pass: exit 0, no diagnostics |
| `node scripts/check-date-library.mjs` | Pass: 36 unique IDs; timing sums reconcile; 6 qualifying free short outings |
| Narrow credential-pattern scan of package text files | No matches for selected private-key, GitHub-token, OpenAI-style-key, or AWS access-key patterns; not a comprehensive security audit |
| Dependency license / vulnerability audit | Not performed |
| Independent browser regression in packaging session | Not performed; user-controlled manual results are in QA.md |
| Exact pnpm 10.34.3 frozen-lockfile installation | Not completed: the package-manager download required network approval that was cancelled. No claim of lockfile reproducibility is made |

The successful npm build resolved Vite 8.3.8 from the exported semver range. The supplied pnpm lockfile remains unchanged. A temporary npm lockfile was removed so two competing lockfiles are not distributed.

Vite emitted a future native-config-loader compatibility warning for the exported configuration's `__dirname` and JSON import without import attributes. The current build passed. No warning suppression or source change was made.

The included GitHub Actions workflow is prepared but has not run; it checks the supplied pnpm lockfile, typecheck, build, and data validator after upload. Its status must be confirmed on GitHub.
