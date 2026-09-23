---
id: HotkeyMeta
title: HotkeyMeta
---

Defined in: [hotkey.types.ts:252](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L252)

Metadata for hotkey and sequence registrations.
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

Defined in: [hotkey.types.ts:256](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L256)

Description of what this hotkey does

***

### group?

```ts
optional group?: string;
```

Defined in: [hotkey.types.ts:258](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L258)

Optional display group. Does not affect matching or scope.

***

### name?

```ts
optional name?: string;
```

Defined in: [hotkey.types.ts:254](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L254)

Human-readable name for this hotkey (e.g., "Save Document")
