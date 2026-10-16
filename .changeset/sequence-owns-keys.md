---
'@tanstack/hotkeys': minor
---

A key that continues or completes a sequence in progress no longer runs chords for the same key. With a `C` chord and a `G` then `C` sequence registered, pressing `G` and then `C` runs only the sequence. Chords on a sequence's first step still run.
