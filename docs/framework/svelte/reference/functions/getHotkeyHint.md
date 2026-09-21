---
id: getHotkeyHint
title: getHotkeyHint
---

```ts
function getHotkeyHint(hotkey, options): SvelteHotkeyHint;
```

Defined in: [packages/svelte-hotkeys/src/getHotkeyHint.svelte.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getHotkeyHint.svelte.ts#L18)

Returns an object with a reactive `visible` getter indicating whether held modifiers reveal this shortcut.
Pass getters to track changing bindings and options.
Uses the nonempty-subset/AltGr rules of `matchesHeldModifiers`; `exact` requires
every modifier. Combine with the action's enabled state before showing a badge.
This helper does not register a shortcut or check whether its target is focused.

## Parameters

### hotkey

`MaybeGetter`\<`RegisterableHotkey`\>

### options

`MaybeGetter`\<`HeldModifierOptions`\> = `{}`

## Returns

[`SvelteHotkeyHint`](../interfaces/SvelteHotkeyHint.md)
