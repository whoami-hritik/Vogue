# Feedback Log — Level 5

## Collection Method

Feedback is collected via:
- Direct X (@vogue_night) DMs and replies
- Telegram / Discord messages when sharing the demo link
- In-app interactions and error reports from the Preprod testnet

## Raw Feedback Log

| Date | Source | Feedback | Status |
|:-----|:-------|:---------|:-------|
| — | — | No feedback collected yet — demo sharing in progress | Pending |

## Themes Observed

*To be filled as real feedback comes in.*

## What We Changed

| Change | Reason | Commit |
|:-------|:-------|:-------|
| Added real Preprod user analytics counter (X / 50) | Make user progress visible on Overview dashboard | `e5265e2` |
| Added `validateEvent()` privacy-strip for analytics | Ensure private fields (maxPositionPct, stopLossPct, tradeSizeUsd, portfolioValue) never reach Supabase | `e5265e2` |
| Deep-linked TX hashes to 1AM & Midnight Explorer | Users asked for direct verification links for Preprod & Preview | `044c154` |
| Integrated 1AM `makeTransfer` with ProofStation fee sponsorship | Trigger native 1AM `Balance & Sign Transaction` popup and log in wallet `TRANSACTIONS` tab | `2743b7c` |
| Fixed 1AM transfer output schema (recipient, type, value, kind) | Provide all 4 required fields with positive transfer value | `bc7957d`, `8c0236a` |
| Updated all explorer links to `explorer.1am.xyz` | Direct deep linking to 1AM explorer with network query parameter | Latest |