---
'@tanstack/lit-hotkeys': patch
---

`@hotkey` on a subclass override now replaces the parent's hotkeys for that method. Before, both registered, so with `@hotkey('K')` on the parent and the override, one K press ran the override twice and logged a duplicate-registration warning. With `@hotkey('J')` on the override, both K and J ran it. An override without `@hotkey` still keeps the parent's hotkeys, and several `@hotkey` decorators on one method still all register.
