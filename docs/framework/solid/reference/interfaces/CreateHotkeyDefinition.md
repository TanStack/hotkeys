---
id: CreateHotkeyDefinition
title: CreateHotkeyDefinition
---

# Interface: CreateHotkeyDefinition

Defined in: [createHotkeys.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeys.ts#L20)

A single hotkey definition for use with `createHotkeys`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [createHotkeys.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeys.ts#L24)

The function to call when the hotkey is pressed

***

### hotkey

```ts
hotkey: RegisterableHotkey;
```

Defined in: [createHotkeys.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeys.ts#L22)

The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object

***

### options?

```ts
optional options: CreateHotkeyOptions;
```

Defined in: [createHotkeys.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeys.ts#L26)

Per-hotkey options (merged on top of commonOptions)
