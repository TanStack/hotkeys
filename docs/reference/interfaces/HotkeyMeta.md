---
id: HotkeyMeta
title: HotkeyMeta
---

# Interface: HotkeyMeta

Defined in: [hotkey.ts:432](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L432)

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
optional description: string;
```

Defined in: [hotkey.ts:436](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L436)

Description of what this hotkey does

***

### name?

```ts
optional name: string;
```

Defined in: [hotkey.ts:434](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L434)

Human-readable name for this hotkey (e.g., "Save Document")
