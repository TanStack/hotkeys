---
id: useHotkeyHint
title: useHotkeyHint
---

```ts
function useHotkeyHint(hotkey, options?): ComputedRef<boolean>;
```

Defined in: [useHotkeyHint.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyHint.ts#L24)

Returns a computed ref indicating whether held modifiers reveal this shortcut.
Pass refs or getters to track changing hotkeys and options. A sequence
reveals its hint from its first step, and an app hotkey uses its effective
hotkey (false while unbound). This helper does not register a shortcut or
check whether its target is focused.

## Parameters

### hotkey

`MaybeRefOrGetter`\<
  \| `AppHotkey`\<`string`, HotkeyChord \| HotkeySequence \| null\>
  \| `RegisterableHotkey`\>

### options?

`MaybeRefOrGetter`\<`HeldModifierOptions`\> = `{}`

## Returns

`ComputedRef`\<`boolean`\>
