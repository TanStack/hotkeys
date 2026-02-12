---
id: isModifierKey
title: isModifierKey
---

# Function: isModifierKey()

```ts
function isModifierKey(event): boolean;
```

Defined in: [parse.ts:284](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/parse.ts#L284)

Checks if a KeyboardEvent represents a modifier-only key press.

Modifier-only keys are keys like 'Control', 'Shift', 'Alt', 'Meta', etc.
that don't have an associated character or action key. This is useful
for filtering out modifier key presses when recording shortcuts.

## Parameters

### event

`KeyboardEvent`

The KeyboardEvent to check

## Returns

`boolean`

True if the event represents a modifier-only key

## Example

```ts
document.addEventListener('keydown', (event) => {
  if (isModifierKey(event)) {
    console.log('Modifier key pressed, waiting for action key...')
    return
  }
  // Process non-modifier key
})
```
