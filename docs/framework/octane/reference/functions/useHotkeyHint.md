---
id: useHotkeyHint
title: useHotkeyHint
---

```ts
function useHotkeyHint(hotkey, options?): boolean;
```

Defined in: [useHotkeyHint.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/useHotkeyHint.ts#L24)

Reports whether held modifiers reveal a shortcut hint. The hint shows only
while the hotkey can fire: some registration of it is enabled and in an
active scope. A sequence reveals its hint from its first step, and an app
hotkey matches its registrations by id and uses its effective hotkey (false
while unbound). No hotkey (`undefined`, `null`, or `''`) returns false. A
hotkey on an element counts only while focus is inside it.

## Parameters

### hotkey

  \| `RegisterableHotkey`
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>
  \| `null`
  \| `undefined`

### options?

`HeldModifierOptions`

## Returns

`boolean`
