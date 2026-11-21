---
'@tanstack/hotkeys': patch
---

CapsLock, NumLock, ScrollLock, Fn, FnLock, and dead keys no longer reset a sequence in progress. Each sends a keydown of its own, so pressing CapsLock or starting an accented letter between `G` and `T` broke `['G', 'T']`. These keys now count only when they match a step, in registered sequences and in `createSequenceMatcher`. One that matches a step of another registered sequence still resets the others. A dead key that matches no step leaves the sequence to the next key, which types its character.
