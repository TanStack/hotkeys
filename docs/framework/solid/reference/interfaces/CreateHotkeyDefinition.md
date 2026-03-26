---
id: CreateHotkeyDefinition
title: CreateHotkeyDefinition
---

# Interface: CreateHotkeyDefinition

Defined in: [createHotkeys.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeys.ts#L19)

A single hotkey definition for use with `createHotkeys`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [createHotkeys.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeys.ts#L23)

The function to call when the hotkey is pressed

***

### hotkey

```ts
hotkey: RegisterableHotkey;
```

Defined in: [createHotkeys.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeys.ts#L21)

The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object

***

### options?

```ts
optional options: CreateHotkeyOptions;
```

Defined in: [createHotkeys.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeys.ts#L25)

Per-hotkey options (merged on top of commonOptions)
