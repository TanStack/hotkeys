---
id: getHotkeyHint
title: getHotkeyHint
---

```ts
function getHotkeyHint(hotkey, options?): SvelteHotkeyHint;
```

Defined in: [packages/svelte-hotkeys/src/getHotkeyHint.svelte.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getHotkeyHint.svelte.ts#L28)

Returns an object with a reactive `visible` getter indicating whether held
modifiers reveal this shortcut. Pass getters to track changing hotkeys and
options. A sequence reveals its hint from its first step, and an app hotkey
uses its effective hotkey (false while unbound). This helper does not
register a shortcut or check whether its target is focused.

## Parameters

### hotkey

`MaybeGetter`\<
  \| `RegisterableHotkey`
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>\>

### options?

`MaybeGetter`\<`HeldModifierOptions`\> = `{}`

## Returns

[`SvelteHotkeyHint`](../interfaces/SvelteHotkeyHint.md)
