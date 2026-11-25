---
'@tanstack/hotkeys': minor
---

When the same sequence completes in two active scopes, only the nested or most recently activated scope's sequence fires, as chords already do and as `activateScope` describes. Before, both fired. Sequences in every active scope still advance, so a dialog's `['G', 'G']` doesn't stop a page's `['G', 'I']`, and the scope decides before the match score.
