---
id: createHotkeyHint
title: createHotkeyHint
---

```ts
function createHotkeyHint(hotkey, options): () => boolean;
```

Defined in: [createHotkeyHint.ts:13](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyHint.ts#L13)

Returns a boolean accessor indicating whether held modifiers reveal this shortcut.
Pass accessors to track changing bindings and options.
Uses the nonempty-subset/AltGr rules of `matchesHeldModifiers`; `exact` requires
every modifier. Combine with the action's enabled state before showing a badge.
This helper does not register a shortcut or check whether its target is focused.

## Parameters

### hotkey

`RegisterableHotkey` | () => `RegisterableHotkey`

### options

`HeldModifierOptions` | () => `HeldModifierOptions`

## Returns

```ts
(): boolean;
```

### Returns

`boolean`
