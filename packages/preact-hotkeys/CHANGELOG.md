# @tanstack/preact-hotkeys

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
