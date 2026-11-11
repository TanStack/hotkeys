---
'@tanstack/hotkeys': patch
---

Fix which hotkey fires for two kinds of macOS key press.

**Option with a letter.** Option changes the character a key types, so the matcher used the key's US position to find the letter. On layouts that move letters, that fired the wrong hotkey: on a French AZERTY Mac, Option and the key labeled A fired `Alt+Q`. The matcher now reads the letter on the keycap from `event.keyCode` when Option is held on macOS, and falls back to the position when `keyCode` names no letter. `Alt+A` fires on the key labeled A on AZERTY, Dvorak, Colemak, and QWERTZ. A letter hotkey also fires when Option types an ASCII symbol, such as `Alt+L` for German Option+L (`@`) and `Mod+Alt+N` for US Cmd+Option+N (`~`). A hotkey with Alt and no Control or Command still does not fire in a text field by default, so Option keeps typing its character there.

**Command and Shift with a symbol key.** With Command held, macOS browsers report the unshifted character, so Cmd+Shift+/ arrives as `/`. That press fired `Mod+/`. It now fires only a hotkey that names Shift, such as `Mod+Shift+/`. This applies to the `` ` ``, `-`, `=`, `[`, `]`, `\`, `;`, `'`, `,`, `.`, and `/` keys where they sit in their US positions. If your Mac users reach a hotkey with Command and Shift through a binding without Shift, such as zooming in with Cmd++ through `Mod+=`, add the Shift binding (`Mod+Shift+=`). The digit row and the numpad are unchanged.
