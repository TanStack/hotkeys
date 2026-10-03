---
id: useHotkeyHint
title: useHotkeyHint
---

```ts
function useHotkeyHint(
   owner, 
   hotkey, 
options?): EmberHotkeyState<boolean>;
```

Defined in: [packages/ember-hotkeys/src/useHotkeyHint.ts:8](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/useHotkeyHint.ts#L8)

Recomputes for held modifiers and tracked changes to the binding or options.

## Parameters

### owner

`object`

### hotkey

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`RegisterableHotkey`\>

### options?

[`MaybeGetter`](../type-aliases/MaybeGetter.md)\<`HeldModifierOptions`\> = `{}`

## Returns

[`EmberHotkeyState`](../interfaces/EmberHotkeyState.md)\<`boolean`\>
