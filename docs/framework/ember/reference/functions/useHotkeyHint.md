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

Defined in: [packages/ember-hotkeys/src/useHotkeyHint.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useHotkeyHint.ts#L24)

Recomputes for held modifiers and tracked changes to the hotkey or options.
The hint shows only while the hotkey can fire: some registration of it is
enabled and in an active scope. A sequence reveals its hint from its first
step, and an app hotkey matches its registrations by id and uses its
effective hotkey (false while unbound). Focus and `target` are not checked.

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
