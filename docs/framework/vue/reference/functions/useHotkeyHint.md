---
id: useHotkeyHint
title: useHotkeyHint
---

```ts
function useHotkeyHint(hotkey, options?): ComputedRef<boolean>;
```

Defined in: [useHotkeyHint.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyHint.ts#L27)

Returns a computed ref indicating whether held modifiers reveal this shortcut.
The hint shows only while the hotkey can fire: some registration of it is
enabled and in an active scope. Pass refs or getters to track changing
hotkeys and options. A sequence reveals its hint from its first step, and
an app hotkey matches its registrations by id and uses its effective hotkey
(false while unbound). No hotkey (`undefined`, `null`, or `''`) returns
false. This helper does not register a shortcut. A hotkey on an element counts only while focus is inside it.

## Parameters

### hotkey

`MaybeRefOrGetter`\<
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>
  \| `RegisterableHotkey`
  \| `null`
  \| `undefined`\>

### options?

`MaybeRefOrGetter`\<`HeldModifierOptions`\> = `{}`

## Returns

`ComputedRef`\<`boolean`\>
