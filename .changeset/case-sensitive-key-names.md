---
'@tanstack/hotkeys': minor
'@tanstack/react-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/angular-hotkeys': minor
'@tanstack/lit-hotkeys': minor
'@tanstack/alpine-hotkeys': minor
'@tanstack/octane-hotkeys': minor
'@tanstack/ember-hotkeys': minor
'@tanstack/hotkeys-devtools': minor
---

Key names are case-sensitive, and key aliases are no longer resolved, which removes the key-name lookup tables from every bundle. Typed hotkeys, recording, matching, and display behave as before.

- Spellings that the hotkey types don't allow, such as `escape`, `Esc`, `f1`, `Plus`, or `pgdn`, now stay as written and don't match. Use the canonical names: `Escape`, `F1`, `+`, `PageDown`. Letters still match in any case, and modifier aliases such as `Ctrl`, `Cmd`, and `Option` still work.
- `validateHotkey` and `checkHotkey` warn about keys that aren't written like a known key, such as `escape`, instead of checking a list of key names. In development, registering such a hotkey logs a warning that it may never fire.
- `formatForDisplay` accepts hotkeys only. Use the new `formatKeyForDisplay` to label a single key that isn't a hotkey, such as a held key from `useHeldKeys`.
- The recorder rejects whitespace characters, such as the non-breaking space from Option+Space on macOS, with the message "Whitespace keys cannot be recorded".
- Saved custom hotkeys and display labels ignore names inherited from `Object.prototype`, such as `toString`. Previously, saved custom hotkeys could keep those ids, and `formatForDisplay` could show function source text for them.
