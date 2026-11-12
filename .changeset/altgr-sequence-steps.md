---
'@tanstack/hotkeys': patch
---

A sequence step typed with AltGr now completes. Pressing AltGr sends a keydown of its own, and that keydown reset any sequence in progress, so `['G', '@']` could never finish on a German keyboard, where AltGr+Q types `@`. An AltGr press is now skipped like a Control, Shift, Alt, or Meta press, in registered sequences and in `createSequenceMatcher`.
