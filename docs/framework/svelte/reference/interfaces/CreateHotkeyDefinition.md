---
id: CreateHotkeyDefinition
title: CreateHotkeyDefinition
---

# Interface: CreateHotkeyDefinition

Defined in: [packages/svelte-hotkeys/src/createHotkeys.svelte.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeys.svelte.ts#L23)

A single hotkey definition for use with `createHotkeys`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeys.svelte.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeys.svelte.ts#L27)

The function to call when the hotkey is pressed

***

### hotkey

```ts
hotkey: MaybeGetter<RegisterableHotkey>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeys.svelte.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeys.svelte.ts#L25)

The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object

***

### options?

```ts
optional options: MaybeGetter<CreateHotkeyOptions>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeys.svelte.ts:29](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeys.svelte.ts#L29)

Per-hotkey options (merged on top of commonOptions)
