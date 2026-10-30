---
'@tanstack/hotkeys': minor
'@tanstack/react-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/angular-hotkeys': minor
'@tanstack/octane-hotkeys': minor
'@tanstack/alpine-hotkeys': minor
'@tanstack/ember-hotkeys': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/lit-hotkeys': minor
---

TanStack Hotkeys no longer depends on `@tanstack/store` or the framework store adapters. Its stores, such as `manager.registrations` and `recorder.store`, keep the same `state`, `get`, `setState`, and `subscribe` API and still work with TanStack Store's framework adapters. Bundles shrink by about 1.3 kB (brotli) in core and about 2.4 kB in the React adapter.

The stores are no longer `Store` instances from `@tanstack/store`, so `instanceof Store` checks and other TanStack Store features, such as `actions`, no longer apply to them.
