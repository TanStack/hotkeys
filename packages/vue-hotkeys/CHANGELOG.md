# @tanstack/vue-hotkeys

## 0.8.0

### Minor Changes

- Refactor hotkey normalization and display formatting APIs in `@tanstack/hotkeys`, align framework packages and devtools, and update display-related constants. ([#85](https://github.com/TanStack/hotkeys/pull/85))

### Patch Changes

- Updated dependencies [[`74b474d`](https://github.com/TanStack/hotkeys/commit/74b474db6e44ad2d0a92f97898f5b145f00b9b93)]:
  - @tanstack/hotkeys@0.6.0

## 0.7.0

### Minor Changes

- Add plural sequence APIs (`useHotkeySequences`, `createHotkeySequences`, `createHotkeySequencesAttachment`, `injectHotkeySequences`) and align `enabled` across adapters: disabled registrations stay in the manager for devtools, only core dispatch is skipped, and toggling `enabled` updates handles via `setOptions` instead of churning unregister/register. ([#80](https://github.com/TanStack/hotkeys/pull/80))

## 0.6.0

### Minor Changes

- Align sequence recording with hotkey-prefixed public API: `HotkeySequenceRecorder`, framework hooks `useHotkeySequenceRecorder` / `createHotkeySequenceRecorder` / `injectHotkeySequenceRecorder`, and provider defaults under `hotkeySequenceRecorder`. ([#78](https://github.com/TanStack/hotkeys/pull/78))

### Patch Changes

- Updated dependencies [[`e04555e`](https://github.com/TanStack/hotkeys/commit/e04555e234bfed439f59c319cc9039a515770d72)]:
  - @tanstack/hotkeys@0.5.0

## 0.5.1

### Patch Changes

- fix: add jsdoc for combos in hotkey sequences ([`4e29eec`](https://github.com/TanStack/hotkeys/commit/4e29eec1eab57c7b2b59ccda84ce32dcb5f9fd8c))

- Updated dependencies [[`a3aa4f3`](https://github.com/TanStack/hotkeys/commit/a3aa4f351067303e792088590067879f639e5d30), [`4e29eec`](https://github.com/TanStack/hotkeys/commit/4e29eec1eab57c7b2b59ccda84ce32dcb5f9fd8c)]:
  - @tanstack/hotkeys@0.4.3

## 0.5.0

### Minor Changes

- feat: add `useHotkeys` composable for registering multiple hotkeys in one call ([#75](https://github.com/TanStack/hotkeys/pull/75))

## 0.4.2

### Patch Changes

- Updated dependencies [[`ac2248c`](https://github.com/TanStack/hotkeys/commit/ac2248c0f5a74db8784fc729861250d75d370db2)]:
  - @tanstack/hotkeys@0.4.2

## 0.4.1

### Patch Changes

- Updated dependencies [[`eaf8b84`](https://github.com/TanStack/hotkeys/commit/eaf8b849d198576c7299d34574c6907581cebfb6)]:
  - @tanstack/hotkeys@0.4.1
