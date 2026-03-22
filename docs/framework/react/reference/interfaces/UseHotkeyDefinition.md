---
id: UseHotkeyDefinition
title: UseHotkeyDefinition
---

# Interface: UseHotkeyDefinition

Defined in: [useHotkeys.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeys.ts#L21)

A single hotkey definition for use with `useHotkeys`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [useHotkeys.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeys.ts#L25)

The function to call when the hotkey is pressed

***

### hotkey

```ts
hotkey: RegisterableHotkey;
```

Defined in: [useHotkeys.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeys.ts#L23)

The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object

***

### options?

```ts
optional options: UseHotkeyOptions;
```

Defined in: [useHotkeys.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeys.ts#L27)

Per-hotkey options (merged on top of commonOptions)
