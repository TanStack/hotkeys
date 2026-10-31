---
'@tanstack/hotkeys': minor
---

Fix several edge cases in hotkey matching, registration and held-key tracking.

- **IME composition:** no hotkey fires while the user composes text with an input method editor, including named keys such as Enter, Escape and the arrows, and the Enter that Safari sends right after composition ends (`keyCode` 229). Before, those keys fired and could prevent the keydown the editor needed.
- **`requireReset`:** a new press that isn't an automatic repeat fires again, even when the last keyup was never seen, such as the one macOS drops while Command is held.
- **Held keys:** the key state tracker clears held keys when the page is hidden and when a native context menu opens. Modifiers the event still reports stay held, and a context menu the page shows or dispatches itself clears nothing.
- **Duplicate registrations:** a `keydown` and a `keyup` registration of the same hotkey are no longer duplicates, so they don't warn, and `conflictBehavior: 'replace'` no longer removes the other one.
- **Invalid targets:** registering with a target that can't listen for events throws without leaving a registration behind, so `resetInstance()` and `destroy()` keep working.
- **Missing hotkeys:** `HotkeyManager.register` returns an inactive handle instead of throwing for an `undefined` or `null` hotkey, an empty sequence, or a hotkey with an empty key such as `''`, `{ key: '' }` or `{ code: '' }`. Nothing is registered, so these still never fire.
- **Speed:** letter keys compare through one cached `Intl.Collator`, which makes dispatching a letter about 3 times faster with many hotkeys registered.
