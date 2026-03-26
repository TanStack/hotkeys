---
"@tanstack/hotkeys": patch
---

fix: check `document.activeElement` in addition to `event.target` for `ignoreInputs` option

Some libraries like React Aria's Autocomplete intercept keydown events from input elements and re-dispatch them on a different element (like a list item). In these cases, `event.target` is the re-dispatched target, not the actual focused input. By also checking `document.activeElement`, we can properly detect when the user is typing in an input even if the event has been re-dispatched.
