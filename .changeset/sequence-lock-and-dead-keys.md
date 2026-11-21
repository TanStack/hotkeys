---
'@tanstack/hotkeys': patch
---

CapsLock, NumLock, ScrollLock, Fn, FnLock, and dead keys no longer reset a sequence in progress. Each sends a keydown of its own, so pressing CapsLock or starting an accented letter between `G` and `T` broke `['G', 'T']`. These keys now count only when they match a step, in registered sequences and in `createSequenceMatcher`. A dead key types its character together with the next key, and that key decides whether the sequence goes on.
