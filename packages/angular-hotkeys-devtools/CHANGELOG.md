# @tanstack/angular-hotkeys-devtools

## 0.4.2

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.7.2

## 0.4.1

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.7.1

## 0.4.0

### Minor Changes

- [#211](https://github.com/TanStack/hotkeys/pull/211) [`8b93ed5`](https://github.com/TanStack/hotkeys/commit/8b93ed5076532efeffce6b37ee56e4ea007a465b) - Each devtools adapter now lists its TanStack Devtools host as an optional peer dependency at the current release, such as `@tanstack/react-devtools` 0.10.14. Older hosts pass the plugin a theme string instead of props, so the panel ignored the theme, and TypeScript rejects the React plugin since `@tanstack/react-hotkeys-devtools` 0.12.0. Package managers now warn about an old host at install time.

  Update `@tanstack/devtools-utils` and `@tanstack/devtools-ui` to 0.7.2. The Preact panel now unmounts its core on Preact 11 (TanStack/devtools#551).

### Patch Changes

- Updated dependencies [[`8b93ed5`](https://github.com/TanStack/hotkeys/commit/8b93ed5076532efeffce6b37ee56e4ea007a465b), [`8b93ed5`](https://github.com/TanStack/hotkeys/commit/8b93ed5076532efeffce6b37ee56e4ea007a465b)]:
  - @tanstack/hotkeys-devtools@1.7.0

## 0.3.2

### Patch Changes

- [#204](https://github.com/TanStack/hotkeys/pull/204) [`5053876`](https://github.com/TanStack/hotkeys/commit/5053876bbd97d6b056cef9eddddcc4e28c249aba) - Fix type errors in the devtools packages with `skipLibCheck: false`. Their declarations used types from `@tanstack/devtools-utils`, which import `@tanstack/devtools` without depending on it, so TypeScript reported `Cannot find module '@tanstack/devtools'`, and with `skipLibCheck: true` the panel props became `any`. The packages now declare their own panel and plugin types. `@tanstack/hotkeys-devtools` exports `HotkeysDevtoolsPanelProps`, `HotkeysDevtoolsTheme` and `HotkeysDevtoolsCoreClass`.

  The React devtools types no longer refer to `JSX` from `react`, which some `@types/react` 18 releases don't export.

- Updated dependencies [[`5053876`](https://github.com/TanStack/hotkeys/commit/5053876bbd97d6b056cef9eddddcc4e28c249aba)]:
  - @tanstack/hotkeys-devtools@1.6.1

## 0.3.1

### Patch Changes

- Updated dependencies [[`431094a`](https://github.com/TanStack/hotkeys/commit/431094a5a5b61a7fd91002fc1cc799373ef54e6e)]:
  - @tanstack/hotkeys-devtools@1.6.0

## 0.3.0

### Minor Changes

- [#194](https://github.com/TanStack/hotkeys/pull/194) [`db47b22`](https://github.com/TanStack/hotkeys/commit/db47b2211884f0b7f5a58f7b2b8234082294a5c5) - Minor release alongside `@tanstack/hotkeys` 0.17.0, which this package now requires. There are no other changes.

### Patch Changes

- Updated dependencies [[`db47b22`](https://github.com/TanStack/hotkeys/commit/db47b2211884f0b7f5a58f7b2b8234082294a5c5)]:
  - @tanstack/hotkeys-devtools@1.5.0

## 0.2.9

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.4.1

## 0.2.8

### Patch Changes

- Updated dependencies [[`dd1f39d`](https://github.com/TanStack/hotkeys/commit/dd1f39d1f27b7e0aa6d1d85bdc151e3434914a22), [`dd1f39d`](https://github.com/TanStack/hotkeys/commit/dd1f39d1f27b7e0aa6d1d85bdc151e3434914a22)]:
  - @tanstack/hotkeys-devtools@1.4.0

## 0.2.7

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.3.6

## 0.2.6

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.3.5

## 0.2.5

### Patch Changes

- Updated dependencies [[`125fde6`](https://github.com/TanStack/hotkeys/commit/125fde6f8ec30f076c40bead0f90ae09b3dc9e1f)]:
  - @tanstack/hotkeys-devtools@1.3.4

## 0.2.4

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.3.3

## 0.2.3

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.3.2

## 0.2.2

### Patch Changes

- Updated dependencies []:
  - @tanstack/hotkeys-devtools@1.3.1

## 0.2.1

### Patch Changes

- Updated dependencies [[`a71180e`](https://github.com/TanStack/hotkeys/commit/a71180ec7f66be52f0aa268a2c2cce2f742d1602)]:
  - @tanstack/hotkeys-devtools@1.3.0

## 0.2.0

### Minor Changes

- [#165](https://github.com/TanStack/hotkeys/pull/165) [`2ebcecf`](https://github.com/TanStack/hotkeys/commit/2ebcecfc673fb7b3b4877624fc832d83532a412a) - Add Alpine, Ember, and Octane adapters with framework-native lifecycle management, scoped defaults, and shared registration reconciliation.

  Support reactive option getters and live recorder options. Follow replacement provider defaults in Solid and Vue, track getters in Ember definitions, and refresh Lit registrations and scoped targets after host updates.

  Add Ember `onHotkey` and `onHotkeys` modifiers for element-scoped shortcuts with reactive options and automatic cleanup.

  Add Angular and Svelte Hotkeys devtools integrations with development-only defaults and explicit production exports.

  Update compatible dependencies and release all Hotkeys adapters and devtools packages together as minor versions.

### Patch Changes

- Updated dependencies [[`2ebcecf`](https://github.com/TanStack/hotkeys/commit/2ebcecfc673fb7b3b4877624fc832d83532a412a)]:
  - @tanstack/hotkeys-devtools@1.2.0
