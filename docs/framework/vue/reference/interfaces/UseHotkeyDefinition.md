---
id: UseHotkeyDefinition
title: UseHotkeyDefinition
---

# Interface: UseHotkeyDefinition

Defined in: packages/vue-hotkeys/src/useHotkeys.ts:21

A single hotkey definition for use with `useHotkeys`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: packages/vue-hotkeys/src/useHotkeys.ts:25

The function to call when the hotkey is pressed

***

### hotkey

```ts
hotkey: MaybeRefOrGetter<RegisterableHotkey>;
```

Defined in: packages/vue-hotkeys/src/useHotkeys.ts:23

The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object

***

### options?

```ts
optional options: MaybeRefOrGetter<UseHotkeyOptions>;
```

Defined in: packages/vue-hotkeys/src/useHotkeys.ts:27

Per-hotkey options (merged on top of commonOptions)
