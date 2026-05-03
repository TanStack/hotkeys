---
id: "@tanstack/ember-hotkeys"
title: "@tanstack/ember-hotkeys"
---

# @tanstack/ember-hotkeys

## Helpers

- [onHotkey](../guides/hotkeys) — Register a single keyboard shortcut
- [onHotkeySequence](../guides/sequences) — Register a multi-key sequence (Vim-style)

## Test Support

- `triggerKeyPress(combo)` — Dispatch a `keydown` event for the given hotkey combo and settle
- `triggerKeyRelease(combo)` — Dispatch a `keyup` event for the given hotkey combo and settle

Import from `@tanstack/ember-hotkeys/test-support`.

## Interfaces

- `OnHotkeySignature` — Glint signature for the `onHotkey` helper
- `OnHotkeyOptions` — Named arguments accepted by `onHotkey`
- `OnHotkeySequenceSignature` — Glint signature for the `onHotkeySequence` helper
- `OnHotkeySequenceOptions` — Named arguments accepted by `onHotkeySequence`

## Template Registry

Import `Registry` from `@tanstack/ember-hotkeys/template-registry` and merge it into your app's registry for Glint strict-mode type checking:

```ts
import type { Registry as EmberHotkeysRegistry } from '@tanstack/ember-hotkeys/template-registry';

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry extends EmberHotkeysRegistry {}
}
```

## Re-exports

This package re-exports everything from the core [`@tanstack/hotkeys`](../../../reference/index) package, so there is no need to install the core package separately.
