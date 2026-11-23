---
'@tanstack/solid-hotkeys': minor
---

Move to Solid 2 and drop Solid 1. `@tanstack/solid-hotkeys` now needs `solid-js` 2 and Node 22.12 or newer. Solid 1 apps can stay on `@tanstack/solid-hotkeys@0.25`, the last release for Solid 1.

- The primitives keep their API. Effects that track reactive options read them in the compute half and apply them in the effect half.
- `HotkeysProvider` renders its context without JSX, so the adapter imports only `solid-js`, not `@solidjs/web`.
- `createHotkeyRegistrations` returns a store reconciled by registration `id`, so `<For>` rows keep their identity when registrations change.
- The internal store selector works like `useSelector` from `@tanstack/solid-store` 1.0: the store state is held in a signal and the selection is derived from it, so a selector that reads other signals tracks them for the current state.
- As with every Solid 2 signal, a value read right after a write outside a reactive scope updates after the next flush (`flush()` from `solid-js`, or the next microtask).
- Don't call `createHotkey` in a `ref` callback. Solid 2 runs ref callbacks outside the component's owner. Give the element its own component with a signal `target` instead.
