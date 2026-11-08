---
'@tanstack/angular-hotkeys': patch
---

Hotkey and recorder callbacks now mark the registering component for check, as Angular's own event listeners do, so a callback that changes a plain field updates the view in zoneless apps and OnPush components. Keys that fire no hotkey still don't run change detection. A callback registered in a service outside any component, such as a root service, has no component to mark, so it must write signals to update OnPush or zoneless views.
