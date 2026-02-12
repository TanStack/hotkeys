---
id: useKeyHold
title: useKeyHold
---

# Function: useKeyHold()

```ts
function useKeyHold(key): boolean;
```

Defined in: [useKeyHold.ts:45](https://github.com/TanStack/keys/blob/main/packages/react-hotkeys/src/useKeyHold.ts#L45)

React hook that returns whether a specific key is currently being held.

This hook uses `useStore` from `@tanstack/react-store` to subscribe
to the global KeyStateTracker and uses a selector to determine if
the specified key is held.

## Parameters

### key

`HeldKey`

The key to check (e.g., 'Shift', 'Control', 'A')

## Returns

`boolean`

True if the key is currently held down

## Examples

```tsx
function ShiftIndicator() {
  const isShiftHeld = useKeyHold('Shift')

  return (
    <div style={{ opacity: isShiftHeld ? 1 : 0.5 }}>
      {isShiftHeld ? 'Shift is pressed!' : 'Press Shift'}
    </div>
  )
}
```

```tsx
function ModifierIndicators() {
  const ctrl = useKeyHold('Control')
  const shift = useKeyHold('Shift')
  const alt = useKeyHold('Alt')

  return (
    <div>
      <span style={{ opacity: ctrl ? 1 : 0.3 }}>Ctrl</span>
      <span style={{ opacity: shift ? 1 : 0.3 }}>Shift</span>
      <span style={{ opacity: alt ? 1 : 0.3 }}>Alt</span>
    </div>
  )
}
```
