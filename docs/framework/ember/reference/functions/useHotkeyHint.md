---
id: useHotkeyHint
title: useHotkeyHint
---

```ts
function useHotkeyHint(
   owner, 
   hotkey, 
options?): EmberHotkeyState<boolean>;
```

Defined in: [packages/ember-hotkeys/src/useHotkeyHint.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useHotkeyHint.ts#L21)

Recomputes for held modifiers and tracked changes to the hotkey or options.
A sequence reveals its hint from its first step, and an app hotkey uses its
effective hotkey (false while unbound).

## Parameters

### owner

`object`

### hotkey

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<
  \| `RegisterableHotkey`
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>\>

### options?

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`HeldModifierOptions`\> = `{}`

## Returns

[`EmberHotkeyState`](../interfaces/EmberHotkeyState.md)\<`boolean`\>
