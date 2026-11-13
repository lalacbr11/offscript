# OffScript: from an everyday problem to a tested prototype

**Creator:** Laura Neugebauer  
**Context:** Handshake AI Skills Studio × Figma prototype challenge  
**Submitted:** November 13, 2026  
**Live demo:** https://inside-fall-14850174.figma.site

## Problem and audience

Long-term couples can fall into familiar evening routines. My wife and I wanted fresh date ideas, but those ideas needed to fit our real time, spending limits, and different energy levels. OffScript is designed for two adults sharing one phone, rather than requiring separate accounts or a new social network.

## Goal

Help both partners participate in choosing a date, then give them a usable plan. Success for this prototype meant completing the planning journey, finding a fitting idea, saving its instructions, and returning later without losing it.

## Product decisions

| Decision | Reason |
|---|---|
| Shared-phone, separate check-ins | Both people contribute without coordinating accounts or devices |
| Hard limits for time, budget, setting, and exclusions | A creative idea is not useful if it ignores the evening’s practical constraints |
| Lower partner energy caps physical effort | A high-energy choice should not override the other partner’s limits |
| Mood ranking within eligible dates | Personalization can be understandable without a runtime AI service |
| 36 curated plans with preparation and timed steps | Specific plans are more actionable than generic activity labels |
| Local saved plans | Keeps the prototype simple and usable without a backend |
| Curated collection rather than live AI generation | Avoids runtime API costs and additional integration scope for the submission |

## Visual direction

Warm cream, deep plum, coral accents, editorial headings, and ticket-like details support the playful concept. These were a starting point, not proof of usability. Clear navigation, feedback, saved-plan access, and partner-answer handling needed testing and revision.

## Build and iteration

Figma Make generated the initial application from a detailed brief. I directed changes and tested the resulting flows on desktop Safari and iPhone Safari. The project grew from a small initial collection into 36 dates with activity exclusions, multiple durations, and clearer matching behavior.

Testing uncovered concrete problems:

- Saved cards could not reopen preparation and instructions.
- “Another idea” appeared unresponsive when only one idea matched.
- The app lacked an obvious Home route from saved and planning screens.
- Back navigation could expose partner one’s filled-in answers.
- A privacy correction introduced a handoff loop without an Edit evening or Restart check-ins route.

Each led to a focused revision and manual retest. See the [bug log](BUG_LOG.md) for symptoms, fixes, and evidence boundaries.

## Validation and outcome

I reported successful checks for published-app persistence, date rotation, activity exclusion behavior, saved-plan navigation, completion/undo, Home navigation, partner handoff privacy, and restart/edit-evening routes. A final published iPhone plan → save → Home → reopen → refresh journey passed before submission.

OffScript was published to Handshake Showcase with a live demo, real iPhone screenshot, and a description of the changes and testing. Competition outcome remains pending. It is also useful to me and my wife for our own date nights; no external user-study results are claimed.

## What I learned

A polished first screen can hide an incomplete experience. The most useful improvements came from asking whether users could return Home, retrieve a saved plan, understand a button’s response, and recover from changed plans. Clear states and escape routes matter as much as a successful forward path.

## Next improvements

Obtain feedback from an independent first-time user, harden local storage validation and error messaging, audit keyboard/focus/contrast behavior, and test browser history more broadly. Runtime AI generation is a possible future direction, not part of this submission.
