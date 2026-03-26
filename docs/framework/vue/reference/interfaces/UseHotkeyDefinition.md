---
id: UseHotkeyDefinition
title: UseHotkeyDefinition
---

# Interface: UseHotkeyDefinition

Defined in: [packages/vue-hotkeys/src/useHotkeys.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeys.ts#L19)

A single hotkey definition for use with `useHotkeys`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [packages/vue-hotkeys/src/useHotkeys.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeys.ts#L23)

The function to call when the hotkey is pressed

***

### hotkey

```ts
hotkey: MaybeRefOrGetter<RegisterableHotkey>;
```

Defined in: [packages/vue-hotkeys/src/useHotkeys.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeys.ts#L21)

The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object

***

### options?

```ts
optional options: MaybeRefOrGetter<UseHotkeyOptions>;
```

Defined in: [packages/vue-hotkeys/src/useHotkeys.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeys.ts#L25)

Per-hotkey options (merged on top of commonOptions)
