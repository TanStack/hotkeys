---
'@tanstack/hotkeys': patch
---

Registering an invalid hotkey now logs a console warning in development, from `HotkeyManager.register` and from every framework adapter. A hotkey with an unknown modifier, such as `Ctl+K`, or with no key that isn't a modifier, such as `Shift`, registers nothing, and it did so silently. An adapter logs once for each invalid hotkey, however often it renders. An empty string, `null`, `undefined`, and an empty sequence still mean "no hotkey" and log nothing. Production builds drop the warning.
