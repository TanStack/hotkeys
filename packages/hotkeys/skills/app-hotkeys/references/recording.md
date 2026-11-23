# Recording a shortcut

Use the adapter's recorder instead of a `keydown` listener that builds a string. The recorder already handles the hard parts:

- It pauses registered hotkeys while recording, so pressing `Mod+S` to record it doesn't save. Leave your hotkeys enabled.
- It records `Mod` rather than Command or Control, and writes keys by name, such as `Mod+S`, on any keyboard layout. A press with no portable name records the key's position in brackets: `Shift+[Slash]` for Shift+/, and `Alt+[Digit1]` for Option+1 instead of `¡`. Save the recorded value as it is; `formatForDisplay` hides the brackets.
- Escape cancels, and so do Tab and Shift+Tab, which move focus so keyboard users can leave. Set `recordTab: true` to record Tab, and show "Press Escape to cancel". Backspace or Delete removes the last step, or with nothing recorded calls `onClear`, which changes nothing on its own: decide whether clearing unbinds (`setCustomHotkey(id, null)`) or resets (`resetCustomHotkey(id)`).
- With `maxSteps: Infinity`, the user can record a sequence, which commits on Enter or after `idleTimeoutMs`.
- `detectConflicts: true` checks only hotkeys registered right now. For app hotkeys, call `findConflicts(id, hotkey, context)` in `validate`, with the `context` that `validate` receives, and return a message to reject; a rejected recording keeps listening.
