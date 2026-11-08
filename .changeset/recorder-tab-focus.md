---
'@tanstack/hotkeys': minor
'@tanstack/angular-hotkeys': patch
'@tanstack/lit-hotkeys': patch
'@tanstack/preact-hotkeys': patch
'@tanstack/react-hotkeys': patch
---

The recorder no longer traps keyboard users. While recording, Tab and Shift+Tab cancel the recording, call `onCancel`, and move focus as usual. Before, Tab was recorded and its default prevented, so Escape was the only way to leave without a mouse. Registered hotkeys still skip that press, so an app's own `Tab` hotkey can't block focus. Tab with Control, Alt, or Meta is handled as before, and so is Tab from a text field while `ignoreInputs` is on (the default): focus moves, but the recording continues and `onCancel` isn't called. Set the new `recordTab: true` option to record Tab and Shift+Tab as before, for example in an editor, and tell users that Escape cancels.
