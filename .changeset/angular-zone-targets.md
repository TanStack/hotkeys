---
'@tanstack/angular-hotkeys': minor
---

- In zone.js apps, hotkey and key state listeners run outside the Angular zone, so typing no longer triggers change detection. Hotkey and recorder callbacks still run inside the zone.
- A target can be an `ElementRef` or a signal of one, such as `viewChild('panel')`.
