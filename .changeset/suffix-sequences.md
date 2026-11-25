---
'@tanstack/hotkeys': minor
---

A key that continues a sequence in progress can no longer start another sequence. With `['A', 'B', 'C']` and `['B', 'C']` registered, typing A B C now runs only `['A', 'B', 'C']`, as in Vim and VS Code. Chords already worked this way. Two cases change: with `['G', 'G']` and `['G', 'G', 'G']`, `['G', 'G']` starts again on the fourth G and fires on the fifth, and with `['A', 'B', 'C']` and `['B', 'D']`, typing A B D no longer fires `['B', 'D']`.
