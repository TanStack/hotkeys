---
id: InjectHotkeyDefinition
title: InjectHotkeyDefinition
---

# Interface: InjectHotkeyDefinition

Defined in: [injectHotkeys.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeys.ts#L20)

A single hotkey definition for use with `injectHotkeys`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [injectHotkeys.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeys.ts#L24)

The function to call when the hotkey is pressed

***

### hotkey

```ts
hotkey: RegisterableHotkey | () => RegisterableHotkey;
```

Defined in: [injectHotkeys.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeys.ts#L22)

The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object

***

### options?

```ts
optional options: 
  | InjectHotkeyOptions
  | () => InjectHotkeyOptions;
```

Defined in: [injectHotkeys.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeys.ts#L26)

Per-hotkey options (merged on top of commonOptions)
