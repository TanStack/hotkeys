---
'@tanstack/hotkeys': patch
---

Hotkeys now prevent the browser's default action on pages that load zone.js, such as Angular apps that use zone change detection, even when another script added a passive `keydown` listener first. zone.js runs every listener it patches for one event type from a single native listener that takes the first listener's options, so `preventDefault` failed after a passive one, and `Mod+S` opened the browser's Save dialog. The hotkey and recorder listeners now attach with the browser's own `addEventListener`. Because of that, a callback passed straight to `HotkeyManager.register` no longer runs inside the Angular zone, so code that relies on zone change detection should call `NgZone.run` in the callback. The Angular adapter already runs callbacks this way.
