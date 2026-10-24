---
id: useHotkeyHint
title: useHotkeyHint
---

```ts
function useHotkeyHint(hotkey, options?): boolean;
```

Defined in: [useHotkeyHint.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeyHint.ts#L26)

Returns a boolean indicating whether held modifiers reveal this shortcut.
The hint shows only while the hotkey can fire: some registration of it is
enabled and in an active scope. An app hotkey matches its registrations by
id and uses its effective hotkey (false while unbound).
Uses the nonempty-subset/AltGr rules of `matchesHeldModifiers`; `exact`
requires every modifier. A sequence reveals its hint from its first step.
Only visibility changes cause a rerender. This helper does not register a
shortcut or check whether its target is focused.

## Parameters

### hotkey

  \| `RegisterableHotkey`
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>

### options?

`HeldModifierOptions` = `{}`

## Returns

`boolean`
