# @tanstack/preact-hotkeys

## 0.8.2

### Patch Changes

- Updated dependencies [[`6939ac7`](https://github.com/TanStack/hotkeys/commit/6939ac7f91ce8b5ffe54cdc122171f277c837c92)]:
  - @tanstack/hotkeys@0.6.2

## 0.8.1

### Patch Changes

- chore: upgrade tanstack store version ([`19a960f`](https://github.com/TanStack/hotkeys/commit/19a960fb07655db28b6ec967cba7f957ece66edb))

- Updated dependencies [[`19a960f`](https://github.com/TanStack/hotkeys/commit/19a960fb07655db28b6ec967cba7f957ece66edb)]:
  - @tanstack/hotkeys@0.6.1

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

- feat: add `useHotkeys` hook for registering multiple hotkeys in one call ([#75](https://github.com/TanStack/hotkeys/pull/75))

## 0.4.2

### Patch Changes

- Updated dependencies [[`ac2248c`](https://github.com/TanStack/hotkeys/commit/ac2248c0f5a74db8784fc729861250d75d370db2)]:
  - @tanstack/hotkeys@0.4.2

## 0.4.1

### Patch Changes

- Updated dependencies [[`eaf8b84`](https://github.com/TanStack/hotkeys/commit/eaf8b849d198576c7299d34574c6907581cebfb6)]:
  - @tanstack/hotkeys@0.4.1

## 0.4.0

### Minor Changes

- add angular adapter and upgrade packages ([#31](https://github.com/TanStack/hotkeys/pull/31))

### Patch Changes

- Updated dependencies [[`c173ed0`](https://github.com/TanStack/hotkeys/commit/c173ed079c6b0f282c9cf8dcb6d9523408eca5a0)]:
  - @tanstack/hotkeys@0.4.0

## 0.3.3

### Patch Changes

- Updated dependencies [[`029f473`](https://github.com/TanStack/hotkeys/commit/029f4733e5e7ed8739cf17125d327c626e4bb1d0)]:
  - @tanstack/hotkeys@0.3.3

## 0.3.2

### Patch Changes

- Updated dependencies [[`67decce`](https://github.com/TanStack/hotkeys/commit/67decced89ce5dc874c5559fefb46096e76e560b)]:
  - @tanstack/hotkeys@0.3.2

## 0.3.1

### Patch Changes

- Updated dependencies [[`762cabf`](https://github.com/TanStack/hotkeys/commit/762cabfd6e765f6ced1efdacbbf296ead0a5a080)]:
  - @tanstack/hotkeys@0.3.1
