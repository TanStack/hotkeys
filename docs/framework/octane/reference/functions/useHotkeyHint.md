---
id: useHotkeyHint
title: useHotkeyHint
---

```ts
function useHotkeyHint(hotkey, options?): boolean;
```

Defined in: [useHotkeyHint.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/useHotkeyHint.ts#L20)

Reports whether held modifiers reveal a shortcut hint. A sequence reveals
its hint from its first step, and an app hotkey uses its effective hotkey
(false while unbound).

## Parameters

### hotkey

  \| `RegisterableHotkey`
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>

### options?

`HeldModifierOptions`

## Returns

`boolean`
