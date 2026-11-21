---
'@tanstack/hotkeys': patch
---

Letters outside the Basic Multilingual Plane now uppercase like other letters, so `Mod+𞤢` and `Mod+𞤀` are the same hotkey. ADLaM, which Windows has a keyboard layout for, and other scripts such as Deseret and Osage store each letter in two UTF-16 units, and `normalizeKeyName` left them lowercase. `normalizeHotkey` then gave the two spellings of one letter different canonical strings, and the recorder and labels showed the lowercase letter.
