---
'@tanstack/hotkeys': minor
---

With the default `ignoreInputs: 'auto'`, hotkeys on function keys (`F1` to `F24`) and media keys now fire while a text field has focus, with any modifiers. These keys type nothing, so a text field has no use for them. Before, an `F5` or `Shift+F10` hotkey was skipped in a text field, and the browser acted on the key instead. Media keys are the keys whose names start with `Audio`, `Browser`, `Launch`, or `Media`, such as `MediaPlayPause` and `AudioVolumeUp`. To keep one of these hotkeys out of text fields, set `ignoreInputs: true` on it.
