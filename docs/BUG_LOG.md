# Bug and iteration log

| ID | Observed problem | Revision | Manual retest |
|---|---|---|---|
| OS-01 | Saved date could not reopen its full instructions | Added View date plan and return navigation; viewing separated from completion | Passed, user reported and screenshots showed correct saved plan |
| OS-02 | Another idea gave no visible response for a single matching option | Added explicit one-match/exhausted notices and adjustment routes | Screenshot showed “This is our only match for your current choices” |
| OS-03 | Only one free short outing matched | Expanded collection to 36 dates and varied categories/durations | Four distinct qualifying outing results observed |
| OS-04 | No clear way Home from Saved dates and planning | Visible Home, contextual Back labels, session Resume | Initially still absent after update; subsequently confirmed present and working |
| OS-05 | Partner two Back exposed partner one’s selected answers | Prevent locked partner-one screen from rendering; route through handoff | Initial exposure user confirmed; corrected behavior subsequently reported |
| OS-06 | Handoff ↔ partner two became a loop | Added Edit evening and explicit Restart check-ins with confirmation | Four targeted checks reported pass |

## Corrected observations, not confirmed defects

- A saved-plan status difference followed an intentional Undo completion action; do not claim state corruption.
- A disappearance after refresh was clarified as occurring in editor preview. Published persistence was subsequently confirmed working; no persistence repair is claimed.

## Current code-review limitations

- Parsed localStorage data is trusted without shape validation; writes fail silently.
- Unfinished plans are session-only.
- Partner privacy is presentation-level on one shared device, not authentication or cryptography.
- The match explanation is curated per idea rather than dynamically generated for every pair of inputs.

The initial Git commit imports an exported snapshot. These entries document the Figma development session and must not be presented as separate historical Git commits.
