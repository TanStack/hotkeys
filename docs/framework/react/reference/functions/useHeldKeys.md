---
id: useHeldKeys
title: useHeldKeys
---

```ts
function useHeldKeys(): string[];
```

Defined in: [useHeldKeys.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHeldKeys.ts#L27)

React hook that returns an array of currently held keyboard keys.

This hook subscribes to the global KeyStateTracker and updates whenever keys are pressed
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
