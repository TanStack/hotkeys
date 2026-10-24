---
id: getHotkeyHint
title: getHotkeyHint
---

```ts
function getHotkeyHint(hotkey, options?): SvelteHotkeyHint;
```

Defined in: [packages/svelte-hotkeys/src/getHotkeyHint.svelte.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getHotkeyHint.svelte.ts#L30)

Returns an object with a reactive `visible` getter indicating whether held
modifiers reveal this shortcut. The hint shows only while the hotkey can
fire: some registration of it is enabled and in an active scope. Pass
getters to track changing hotkeys and options. A sequence reveals its hint
from its first step, and an app hotkey matches its registrations by id and
uses its effective hotkey (false while unbound). This helper does not register a shortcut. A hotkey on an element counts only while focus is inside it.

## Parameters

### hotkey

`MaybeGetter`\<
  \| `RegisterableHotkey`
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>\>

### options?

`MaybeGetter`\<`HeldModifierOptions`\> = `{}`

## Returns

[`SvelteHotkeyHint`](../interfaces/SvelteHotkeyHint.md)
