---
id: CreateHotkeyOptions
title: CreateHotkeyOptions
---

# Interface: CreateHotkeyOptions

Defined in: [packages/svelte-hotkeys/src/createHotkey.svelte.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkey.svelte.ts#L17)

## Extends

- `Omit`\<`HotkeyOptions`, `"target"`\>

## Properties

### target?

```ts
optional target: Target;
```

Defined in: [packages/svelte-hotkeys/src/createHotkey.svelte.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkey.svelte.ts#L23)

The DOM element to attach the event listener to.
Can be a Svelte ref, direct DOM element, or null.
Defaults to document.
