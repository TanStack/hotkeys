---
id: injectHotkeyHint
title: injectHotkeyHint
---

```ts
function injectHotkeyHint(hotkey, options?): Signal<boolean>;
```

Defined in: [injectHotkeyHint.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyHint.ts#L26)

Returns a signal indicating whether held modifiers reveal this shortcut.
The hint shows only while the hotkey can fire: some registration of it is
enabled and in an active scope. Pass getters to track changing hotkeys and
options. A sequence reveals its hint from its first step, and an app hotkey
matches its registrations by id and uses its effective hotkey (false while
unbound). This helper does not register a shortcut. A hotkey on an element counts only while focus is inside it.

## Parameters

### hotkey

  \| `RegisterableHotkey`
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>
  \| (() => RegisterableHotkey \| AppHotkey\<string, HotkeyChord \| HotkeySequence \| null\>)

### options?

`HeldModifierOptions` \| (() => `HeldModifierOptions`)

## Returns

`Signal`\<`boolean`\>
