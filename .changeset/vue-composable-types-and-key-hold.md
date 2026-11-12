---
'@tanstack/vue-hotkeys': patch
---

- `useKeyHold` no longer re-runs its dependents on every key event on Vue 3.3. Pressing or releasing another key now notifies nothing on any supported Vue version.
- `useHeldKeys`, `useHeldKeyCodes`, and `useHotkeyScopesState` return `Readonly<Ref<T>>`, and `useKeyHold` returns `ComputedRef<boolean>`. In the browser the refs were already read-only, where Vue ignored a write and warned. A write is now a type error.
- `useHotkey(() => 'Mod+S', callback)` type-checks. A getter or computed that returned one string literal was rejected. A ref declared on its own still needs the `Hotkey` type: `ref<Hotkey>('Mod+S')`.
