---
id: createKeyHold
title: createKeyHold
---

# Function: createKeyHold()

```ts
function createKeyHold(key): () => boolean;
```

Defined in: [createKeyHold.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createKeyHold.ts#L44)

SolidJS primitive that returns whether a specific key is currently being held.

This primitive subscribes to the global KeyStateTracker and returns a
signal accessor that evaluates to true when the specified key is held.

## Parameters

### key

The key to check (e.g., 'Shift', 'Control', 'A') - can be an accessor function

`HeldKey` | () => `HeldKey`

## Returns

Signal accessor that returns true if the key is currently held down

```ts
(): boolean;
```

### Returns

`boolean`

## Examples

```tsx
function ShiftIndicator() {
  const isShiftHeld = createKeyHold('Shift')

  return (
    <div style={{ opacity: isShiftHeld() ? 1 : 0.5 }}>
      {isShiftHeld() ? 'Shift is pressed!' : 'Press Shift'}
    </div>
  )
}
```

```tsx
function ModifierIndicators() {
  const ctrl = createKeyHold('Control')
  const shift = createKeyHold('Shift')
  const alt = createKeyHold('Alt')

  return (
    <div>
      <span style={{ opacity: ctrl() ? 1 : 0.3 }}>Ctrl</span>
      <span style={{ opacity: shift() ? 1 : 0.3 }}>Shift</span>
      <span style={{ opacity: alt() ? 1 : 0.3 }}>Alt</span>
    </div>
  )
}
```
