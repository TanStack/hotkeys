---
id: injectHotkeyHint
title: injectHotkeyHint
---

```ts
function injectHotkeyHint(hotkey, options): Signal<boolean>;
```

Defined in: [injectHotkeyHint.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyHint.ts#L14)

Returns a computed signal indicating whether held modifiers reveal this shortcut.
Call in an injection context; pass signal getters for changing inputs.
Uses the nonempty-subset/AltGr rules of `matchesHeldModifiers`; `exact` requires
every modifier. Combine with the action's enabled state before showing a badge.
This helper does not register a shortcut or check whether its target is focused.

## Parameters

### hotkey

`RegisterableHotkey` | () => `RegisterableHotkey`

### options

`HeldModifierOptions` | () => `HeldModifierOptions`

## Returns

`Signal`\<`boolean`\>
