---
id: UseHotkeyDefinition
title: UseHotkeyDefinition
---

# Interface: UseHotkeyDefinition

Defined in: [useHotkeys.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeys.ts#L20)

A single hotkey definition for use with `useHotkeys`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [useHotkeys.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeys.ts#L24)

The function to call when the hotkey is pressed

***

### hotkey

```ts
hotkey: RegisterableHotkey;
```

Defined in: [useHotkeys.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeys.ts#L22)

The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object

***

### options?

```ts
optional options: UseHotkeyOptions;
```

Defined in: [useHotkeys.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeys.ts#L26)

Per-hotkey options (merged on top of commonOptions)
