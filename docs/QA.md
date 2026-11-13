# QA evidence

## Evidence boundaries

This is a reconstructed record of tests and feedback from the November 13, 2026 development session, not a historical automated test-run export.

- **Laura reported:** manual actions/results from the published app and editor preview. Screenshots supported several observations; device/browser versions and exact builds were not recorded consistently.
- **Figma Make reported:** its own build, data, and headless-browser checks. Those reports were visible in screenshots, but raw logs were not supplied; they are not independently reclassified as verified tests here.
- **Packaging checks:** documented separately below, with actual commands/results. No browser/account control was used during portfolio preparation.

## Manual regression record

| ID | Scenario | Reported outcome | Qualification |
|---|---|---|---|
| M01 | Main setup → two check-ins → reveal | Pass | Desktop and iPhone flows reported working |
| M02 | Free / 60 minutes / Going out rotation | Pass | Bookshop Fortune, Alphabet Walk, Tourist in Your Own Town, Architecture Awards shown distinctly |
| M03 | Cozy + Playful check-ins | Pass | Alternate First Date result discussed; specific mood pair corrected by Laura |
| M04 | Activity exclusion check | Pass, user reported | No exhaustive category matrix or raw test log supplied |
| M05 | Save → full plan → return | Pass after fix | Correct preparation, three steps, and original plan recovered |
| M06 | Complete, feedback, undo completion | Pass, user reported | Status confusion during review was resolved as an intentional undo, not a confirmed defect |
| M07 | Published save → refresh → reopen | Pass | An initial failure report concerned editor preview; it was explicitly corrected. Do not claim a published persistence bug was fixed |
| M08 | Contextual Back preserves setup | Pass | User confirmed choices remained |
| M09 | Visible Home + Resume | Controls added; navigation reported working | Initial round had no Home, so Resume was blocked rather than passed; later reports confirmed improvement |
| M10 | Partner two Back hides partner one | Pass after fix | Initial exposure confirmed, then user reported corrected handoff behavior |
| M11 | Handoff Edit evening, restart cancel/confirm | All four requested checks reported pass | Shared-phone UI privacy only; no security audit |
| M12 | Updated phone layout | Pass, user reported | No claim of complete responsive or accessibility coverage |
| M13 | Final published phone plan → save → Home → saved detail → refresh | Pass, user reported | Last submission smoke check |

## Packaging verification

See [VALIDATION.md](VALIDATION.md) for the current reproducibility results. Source review verifies implementation structure; it does not replace interactive testing.

## Remaining targeted checks

- Keyboard-only interaction and focus restoration, especially confirmation dialog.
- Screen-reader labels, announcements, contrast, and 200% zoom.
- Browser Back/Forward across refresh, restart, and saved detail states.
- Blocked/full/malformed localStorage.
- Longer date histories, ties, exhaustion, and conflicting exclusions.
- Independent first-time user feedback.
