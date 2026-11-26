---
'@tanstack/hotkeys': patch
---

The release of a key the recorder recorded no longer reaches the page, as its press already didn't, so a dialog that closes on an Escape keyup stays open when Escape cancels a recording. A sequence in progress now resets when a recording starts, since the recorder takes every key until it ends. An autofill keydown during a recording no longer leaves the recorder blocking later autofill events.
