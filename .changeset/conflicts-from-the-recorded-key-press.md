---
'@tanstack/hotkeys': minor
'@tanstack/react-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/angular-hotkeys': minor
'@tanstack/lit-hotkeys': minor
'@tanstack/alpine-hotkeys': minor
'@tanstack/octane-hotkeys': minor
'@tanstack/ember-hotkeys': minor
---

App hotkey conflict checks can now use the key press that recorded a hotkey. `findConflicts(id, hotkey, context)` and `setCustomHotkey(id, hotkey, context)` take the `context` that a recorder passes to `validate`, on `AppHotkeysStore` and in every adapter.

Two hotkeys can be written differently and still fire for the same key press. On a US keyboard, a recorded `Shift+[Slash]` and a declared `?` are one press, and so are a recorded `Mod+[KeyS]` and a declared `Mod+S`. Without the key press, the check compares how the hotkeys are written and misses these. Pass the context in a shortcut settings screen:

```ts
validate: (hotkey, context) =>
  findConflicts(id, hotkey, context).length === 0 || 'Already in use',
```

The recorder's `onRecord` callback now receives the same context as its second argument. If a test asserts the exact arguments of your `onRecord` callback, add the second argument to the assertion.
