---
'@tanstack/hotkeys': patch
---

The active scope now decides which chord handles a key press before the match score does, as the scopes guide describes. Before, a scope's hotkey could lose to an outer one on some keyboard layouts. With a `dialog` scope holding `Mod+S` and a global `Mod+[KeyS]`, the dialog won on a US layout, but on a Russian layout the global hotkey won, because `Mod+S` matched there through the key's position. Within one scope, exact matches still outrank position fallbacks. A scope's fallback match now also beats an outer exact one: with a global `Mod+Ы` and a dialog `Mod+S`, a Russian Ctrl+ы fires the dialog hotkey. Sequences still rank by match score alone.
