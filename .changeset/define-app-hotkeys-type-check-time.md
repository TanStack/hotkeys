---
'@tanstack/hotkeys': patch
---

`defineAppHotkeys` type-checks quickly again on TypeScript 5.7 and later. A call with a few dozen entries took seconds and gigabytes there, and 50 sequence entries ran `tsc` out of memory, because the parameter type intersected each declaration with a copy of itself. 50 sequence entries now check in about a tenth of a second. The accepted declarations and the returned types are unchanged.
