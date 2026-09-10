---
id: InjectHotkeyDefinition
title: InjectHotkeyDefinition
---

# Interface: InjectHotkeyDefinition

Defined in: [injectHotkeys.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeys.ts#L19)

A single hotkey definition for use with `injectHotkeys`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [injectHotkeys.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeys.ts#L23)

The function to call when the hotkey is pressed

***

### hotkey

```ts
hotkey: RegisterableHotkey | () => RegisterableHotkey;
```

Defined in: [injectHotkeys.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeys.ts#L21)

The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object

***

### options?

```ts
optional options: 
  | InjectHotkeyOptions
  | () => InjectHotkeyOptions;
```

Defined in: [injectHotkeys.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeys.ts#L25)

Per-hotkey options (merged on top of commonOptions)
