---
id: useHeldKeys
title: useHeldKeys
---

# Function: useHeldKeys()

```ts
function useHeldKeys(): string[];
```

Defined in: [useHeldKeys.ts:26](https://github.com/TanStack/keys/blob/main/packages/react-hotkeys/src/useHeldKeys.ts#L26)

React hook that returns an array of currently held keyboard keys.

This hook uses `useStore` from `@tanstack/react-store` to subscribe
to the global KeyStateTracker and updates whenever keys are pressed
or released.

## Returns

`string`[]

Array of currently held key names

## Example

```tsx
function KeyDisplay() {
  const heldKeys = useHeldKeys()

  return (
    <div>
      Currently pressed: {heldKeys.join(' + ') || 'None'}
    </div>
  )
}
```
