---
'@tanstack/solid-hotkeys': minor
---

Support Solid 2. `@tanstack/solid-hotkeys` now requires `solid-js` 2 (`>=2.0.0-rc.19 <3.0.0`); stay on 0.18.x for Solid 1.

- The primitives keep their API. Reactive options are tracked by split effects (compute reads the options, the effect applies them), `HotkeysProvider` publishes its store in `onSettled`, and provider props read once at creation are read untracked.
- `HotkeysProvider` renders the Solid 2 context without JSX, so the adapter depends on `solid-js` only.
- The internal store selector writes with `ownedWrite`, since store updates arrive from outside the owner.
- `createHotkeyRegistrations` returns a store reconciled by registration `id`, so `<For>` rows keep their identity when registrations change.
- As with every Solid 2 signal, values read right after a write outside a reactive scope update after the next flush (`flush()` from `solid-js`, or the next microtask).
- `@tanstack/solid-hotkeys-devtools` stays on Solid 1 until TanStack Devtools has a Solid 2 entry.
