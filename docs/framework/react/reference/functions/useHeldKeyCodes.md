---
id: useHeldKeyCodes
title: useHeldKeyCodes
---

# Function: useHeldKeyCodes()

```ts
function useHeldKeyCodes(): Record<string, string>;
```

Defined in: [useHeldKeyCodes.ts:30](https://github.com/TanStack/keys/blob/main/packages/react-hotkeys/src/useHeldKeyCodes.ts#L30)

React hook that returns a map of currently held key names to their physical `event.code` values.

This is useful for debugging which physical key was pressed (e.g. distinguishing
left vs right Shift via "ShiftLeft" / "ShiftRight").

## Returns

`Record`\<`string`, `string`\>

Record mapping normalized key names to their `event.code` values

## Example

```tsx
function KeyDebugDisplay() {
  const heldKeys = useHeldKeys()
  const heldCodes = useHeldKeyCodes()

  return (
    <div>
      {heldKeys.map((key) => (
        <kbd key={key}>
          {key} <small>{heldCodes[key]}</small>
        </kbd>
      ))}
    </div>
  )
}
```
