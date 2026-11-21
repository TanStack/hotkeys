---
'@tanstack/hotkeys': patch
---

Control alone, or Command alone on macOS, with a digit-row key that types `-`, `+`, or `=` no longer fires the digit's hotkey. AZERTY types `-` on the 6 key, so Ctrl+- fired `Mod+6` and stopped the browser from zooming out. Czech and Slovak Ctrl++ on the 1 key fired `Mod+1` the same way. These presses now reach the browser. `Mod+6` still fires on AZERTY with Ctrl+Shift+6, which types `6`, and as `Mod+[Digit6]`. Presses with another modifier still fall back, so German Ctrl+Shift+0 (`=`) still fires `Mod+Shift+0`. A `keyup` hotkey now fires on the release of the key that started it, even when that key types something else by then, such as AZERTY 6 when Shift is released first. Before, a `keyup` hotkey for a symbol typed with Shift, such as `?`, never fired when Shift came up before the key. A space typed on the digit row, as macOS Spanish Option+Shift+6 does, now falls back to the digit too.
