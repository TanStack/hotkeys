---
id: createHotkeyHint
title: createHotkeyHint
---

```ts
function createHotkeyHint(hotkey, options?): () => boolean;
```

Defined in: [createHotkeyHint.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyHint.ts#L24)

Returns an accessor indicating whether held modifiers reveal this shortcut.
The hint shows only while the hotkey can fire: some registration of it is
enabled and in an active scope. A sequence reveals its hint from its first
step, and an app hotkey matches its registrations by id and uses its
effective hotkey (false while unbound). This helper does not register a shortcut. A hotkey on an element counts only while focus is inside it.

## Parameters

### hotkey

  \| `RegisterableHotkey`
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>
  \| (() => RegisterableHotkey \| AppHotkey\<string, HotkeyChord \| HotkeySequence \| null\>)

### options?

`HeldModifierOptions` \| (() => `HeldModifierOptions`)

## Returns

() => `boolean`
