---
id: createHotkeyHint
title: createHotkeyHint
---

```ts
function createHotkeyHint(hotkey, options?): () => boolean;
```

Defined in: [createHotkeyHint.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyHint.ts#L22)

Returns an accessor indicating whether held modifiers reveal this shortcut.
A sequence reveals its hint from its first step, and an app hotkey uses its
effective hotkey (false while unbound). This helper does not register a
shortcut or check whether its target is focused.

## Parameters

### hotkey

  \| `RegisterableHotkey`
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>
  \| (() => RegisterableHotkey \| AppHotkey\<string, HotkeyChord \| HotkeySequence \| null\>)

### options?

`HeldModifierOptions` \| (() => `HeldModifierOptions`)

## Returns

() => `boolean`
