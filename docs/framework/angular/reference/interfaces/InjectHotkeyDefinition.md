---
id: InjectHotkeyDefinition
title: InjectHotkeyDefinition
---

# Interface: InjectHotkeyDefinition

Defined in: injectHotkeys.ts:20

A single hotkey definition for use with `injectHotkeys`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: injectHotkeys.ts:24

The function to call when the hotkey is pressed

***

### hotkey

```ts
hotkey: RegisterableHotkey | () => RegisterableHotkey;
```

Defined in: injectHotkeys.ts:22

The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object

***

### options?

```ts
optional options: 
  | InjectHotkeyOptions
  | () => InjectHotkeyOptions;
```

Defined in: injectHotkeys.ts:26

Per-hotkey options (merged on top of commonOptions)
