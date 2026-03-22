---
id: CreateHotkeyDefinition
title: CreateHotkeyDefinition
---

# Interface: CreateHotkeyDefinition

Defined in: [packages/svelte-hotkeys/src/createHotkeys.svelte.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeys.svelte.ts#L24)

A single hotkey definition for use with `createHotkeys`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeys.svelte.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeys.svelte.ts#L28)

The function to call when the hotkey is pressed

***

### hotkey

```ts
hotkey: MaybeGetter<RegisterableHotkey>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeys.svelte.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeys.svelte.ts#L26)

The hotkey string (e.g., 'Mod+S', 'Escape') or RawHotkey object

***

### options?

```ts
optional options: MaybeGetter<CreateHotkeyOptions>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeys.svelte.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeys.svelte.ts#L30)

Per-hotkey options (merged on top of commonOptions)
