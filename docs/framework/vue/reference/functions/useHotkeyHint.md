---
id: useHotkeyHint
title: useHotkeyHint
---

```ts
function useHotkeyHint(hotkey, options?): ComputedRef<boolean>;
```

Defined in: [useHotkeyHint.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeyHint.ts#L14)

Returns a computed ref indicating whether held modifiers reveal this shortcut.
Pass refs or getters to track changing bindings and options.
Uses the nonempty-subset/AltGr rules of `matchesHeldModifiers`; `exact` requires
every modifier. Combine with the action's enabled state before showing a badge.
This helper does not register a shortcut or check whether its target is focused.

## Parameters

### hotkey

`MaybeRefOrGetter`\<`RegisterableHotkey`\>

### options?

`MaybeRefOrGetter`\<`HeldModifierOptions`\> = `{}`

## Returns

`ComputedRef`\<`boolean`\>
