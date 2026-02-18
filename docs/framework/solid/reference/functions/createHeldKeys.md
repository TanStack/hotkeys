---
id: createHeldKeys
title: createHeldKeys
---

# Function: createHeldKeys()

```ts
function createHeldKeys(): () => string[];
```

Defined in: [createHeldKeys.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHeldKeys.ts#L26)

SolidJS primitive that returns a signal of currently held keyboard keys.

This primitive uses `useStore` from `@tanstack/solid-store` to subscribe
to the global KeyStateTracker and updates whenever keys are pressed
or released.

## Returns

Signal accessor for array of currently held key names

```ts
(): string[];
```

### Returns

`string`[]

## Example

```tsx
function KeyDisplay() {
  const heldKeys = createHeldKeys()

  return (
    <div>
      Currently pressed: {heldKeys().join(' + ') || 'None'}
    </div>
  )
}
```
