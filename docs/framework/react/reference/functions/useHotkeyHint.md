---
id: useHotkeyHint
title: useHotkeyHint
---

```ts
function useHotkeyHint(hotkey, options?): boolean;
```

Defined in: [useHotkeyHint.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkeyHint.ts#L28)

Returns a boolean indicating whether held modifiers reveal this shortcut.
The hint shows only while the hotkey can fire: some registration of it is
enabled and in an active scope. An app hotkey matches its registrations by
id and uses its effective hotkey (false while unbound). No hotkey
(`undefined`, `null`, or `''`) returns false.
Uses the nonempty-subset/AltGr rules of `matchesHeldModifiers`; `exact`
requires every modifier. A sequence reveals its hint from its first step.
Only visibility changes cause a rerender. This helper does not register a shortcut. A hotkey on an element counts only while focus is inside it.

## Parameters

### hotkey

  \| `RegisterableHotkey`
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>
  \| `null`
  \| `undefined`

### options?

`HeldModifierOptions` = `{}`

## Returns

`boolean`
