---
'@tanstack/lit-hotkeys': minor
---

- `@hotkey` works with standard (TC39) decorators as well as `experimentalDecorators`. It calls a subclass's override of the decorated method, and with standard decorators it also works on `#private` methods.
- `HotkeyController` adds itself to its host, so a class field is enough.
- `HeldKeysController` reports keys already held when the host connects or moves.
- Adding a controller to its host twice no longer subscribes twice.
