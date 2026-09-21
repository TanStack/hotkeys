---
id: HotkeyMeta
title: HotkeyMeta
---

Defined in: [hotkey.ts:404](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L404)

Metadata for hotkey and sequence registrations.
Includes `name` and `description` by default. Extend via declaration merging:

## Example

```ts
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    category?: string
    icon?: string
  }
}
```

## Properties

### description?

```ts
optional description?: string;
```

Defined in: [hotkey.ts:408](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L408)

Description of what this hotkey does

***

### name?

```ts
optional name?: string;
```

Defined in: [hotkey.ts:406](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L406)

Human-readable name for this hotkey (e.g., "Save Document")
