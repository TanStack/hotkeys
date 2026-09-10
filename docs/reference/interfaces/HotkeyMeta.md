---
id: HotkeyMeta
title: HotkeyMeta
---

# Interface: HotkeyMeta

Defined in: [hotkey.ts:431](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L431)

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

Defined in: [hotkey.ts:435](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L435)

Description of what this hotkey does

***

### name?

```ts
optional name: string;
```

Defined in: [hotkey.ts:433](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L433)

Human-readable name for this hotkey (e.g., "Save Document")
