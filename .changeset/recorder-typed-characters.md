---
'@tanstack/hotkeys': minor
---

The recorder's default `recordBy: 'auto'` records what the user typed, written as by hand, where it recorded a physical code before:

- A symbol typed with Shift records without Shift: Shift+/ records `?` (was `Shift+[Slash]`), AZERTY Shift+& records `1`, and German Shift+3 records `§`. Ctrl+Shift+/ and macOS Cmd+Shift+/ both record `Mod+?` (was `Mod+Shift+[Slash]`). On macOS, where Command may report the unshifted character, Command+Shift keeps Shift unless the key is in its US position: Dvorak Cmd+Shift+/ records `Mod+Shift+/`, and Cmd+Shift+, records `Mod+Shift+,`.
- With Control, Command or Alt, a digit-row key records its digit: AZERTY Ctrl+& records `Mod+1` (was `Mod+&`), Ctrl+Shift+1 records `Mod+Shift+1`, and macOS Option+1 records `Alt+1`.
- A character typed with AltGr records as itself (German AltGr+Q records `@`). It was rejected with `'alt-graph'`, which is now reported only for an AltGr press that typed nothing to record, and for every AltGr press with `recordBy: 'code'`.
- Numpad Enter records `Enter`, and a numpad operator without Shift records its character (Ctrl+numpad + records `Mod++`).

These recordings compare equal to the same hotkey written by hand, fire on every layout that types the character, and show the character as their label. macOS Cmd+Shift+/ also fires `Mod+?` now, as Ctrl+Shift+/ does on Windows and Linux, on keys in their US position other than `,` and `.`. `Mod+Shift+/` still fires and ranks first. The development warning about Command on macOS now names only the bindings that still can't fire there: the shifted digit row, such as `Mod+!`, and `Mod+<` and `Mod+>`.

Hotkeys saved by earlier versions, such as `Shift+[Slash]`, keep firing on the same key. They are spelled differently from a new recording of the same press, so pass the recorder's `context` to `findConflicts` and `setCustomHotkey`, or use `detectConflicts`, to find the collision. Set `recordBy: 'code'` to keep recording physical codes.
