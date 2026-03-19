---
'@tanstack/hotkeys': patch
---

Fix Alt+punctuation hotkeys not firing on macOS due to Option key character composition

On macOS, the Option (Alt) key acts as a character composer for punctuation keys (e.g., Option+- produces an en-dash '–'), causing `event.key` to differ from the expected character. Added an `event.code` fallback for punctuation keys (Minus, Equal, Slash, BracketLeft, BracketRight, Backslash, Comma, Period, Backquote, Semicolon), matching the existing fallback pattern for letter and digit keys.
