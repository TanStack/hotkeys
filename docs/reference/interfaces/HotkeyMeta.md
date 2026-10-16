---
id: HotkeyMeta
title: HotkeyMeta
---

Defined in: [hotkey.types.ts:268](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L268)

Metadata for hotkey registrations, chords and sequences alike.
Includes `name`, `description`, and `group` by default. Extend via declaration merging:

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

Defined in: [hotkey.types.ts:272](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L272)

Description of what this hotkey does

***

### group?

```ts
optional group?: string;
```

Defined in: [hotkey.types.ts:274](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L274)

Optional display group. Does not affect matching or scope.

***

### name?

```ts
optional name?: string;
```

Defined in: [hotkey.types.ts:270](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L270)

Human-readable name for this hotkey (e.g., "Save Document")
