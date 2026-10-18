---
id: HotkeyMeta
title: HotkeyMeta
---

Defined in: [hotkey.types.ts:308](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L308)

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

Defined in: [hotkey.types.ts:312](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L312)

Description of what this hotkey does

***

### group?

```ts
optional group?: string;
```

Defined in: [hotkey.types.ts:314](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L314)

Optional display group. Does not affect matching or scope.

***

### name?

```ts
optional name?: string;
```

Defined in: [hotkey.types.ts:310](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L310)

Human-readable name for this hotkey (e.g., "Save Document")
