# @tanstack/octane-hotkeys

## 0.3.0

### Minor Changes

- [#170](https://github.com/TanStack/hotkeys/pull/170) [`839ee94`](https://github.com/TanStack/hotkeys/commit/839ee941a9b2ee2cf5f70f28b161757bcfd61931) - Require octane `>=0.12.0` and depend on `@tanstack/octane-store` `^0.13.0`. `HotkeysProvider` now renders the context itself as the provider, since octane removed `Context.Provider`.

## 0.2.0

### Minor Changes

- [#165](https://github.com/TanStack/hotkeys/pull/165) [`2ebcecf`](https://github.com/TanStack/hotkeys/commit/2ebcecfc673fb7b3b4877624fc832d83532a412a) - Add Alpine, Ember, and Octane adapters with framework-native lifecycle management, scoped defaults, and shared registration reconciliation.

  Support reactive option getters and live recorder options. Follow replacement provider defaults in Solid and Vue, track getters in Ember definitions, and refresh Lit registrations and scoped targets after host updates.

  Add Ember `onHotkey` and `onHotkeys` modifiers for element-scoped shortcuts with reactive options and automatic cleanup.

  Add Angular and Svelte Hotkeys devtools integrations with development-only defaults and explicit production exports.

  Update compatible dependencies and release all Hotkeys adapters and devtools packages together as minor versions.

### Patch Changes

- Updated dependencies [[`2ebcecf`](https://github.com/TanStack/hotkeys/commit/2ebcecfc673fb7b3b4877624fc832d83532a412a)]:
  - @tanstack/hotkeys@0.11.0
