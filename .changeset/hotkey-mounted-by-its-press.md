---
'@tanstack/hotkeys': patch
---

A hotkey that a key press registers, enables, or brings into an active scope no longer fires on that same press. Before, pressing Enter on a button that opens a dialog also fired the dialog's `Enter` hotkey, because the dialog registered it, or activated its scope, while the press was still being handled. This also covers a click or focus handler that the key press triggers. A keyup sequence doesn't start on the release of that press either. Holding a key behaves as before, so its auto-repeats still reach hotkeys that registered during the hold, and a keyup hotkey that its own keydown enables, to end a mode, still fires on that release.
