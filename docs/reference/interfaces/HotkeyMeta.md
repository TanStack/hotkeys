---
id: HotkeyMeta
title: HotkeyMeta
---

Defined in: [hotkey.types.ts:269](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L269)

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

Defined in: [hotkey.types.ts:273](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L273)

Description of what this hotkey does

***

### group?

```ts
optional group?: string;
```

Defined in: [hotkey.types.ts:275](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L275)

Optional display group. Does not affect matching or scope.

***

### name?

```ts
optional name?: string;
```

Defined in: [hotkey.types.ts:271](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L271)

Human-readable name for this hotkey (e.g., "Save Document")
