---
id: useHotkeyHint
title: useHotkeyHint
---

```ts
function useHotkeyHint(hotkey, options): boolean;
```

Defined in: [useHotkeyHint.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeyHint.ts#L12)

Returns a boolean indicating whether held modifiers reveal this shortcut.
Only visibility changes from held-key updates cause a rerender.
Uses the nonempty-subset/AltGr rules of `matchesHeldModifiers`; `exact` requires
every modifier. Combine with the action's enabled state before showing a badge.
This helper does not register a shortcut or check whether its target is focused.

## Parameters

### hotkey

`RegisterableHotkey`

### options

`HeldModifierOptions` = `{}`

## Returns

`boolean`
