---
id: createHeldKeyCodes
title: createHeldKeyCodes
---

# Function: createHeldKeyCodes()

```ts
function createHeldKeyCodes(): () => Record<string, string>;
```

Defined in: [createHeldKeyCodes.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHeldKeyCodes.ts#L32)

SolidJS primitive that returns a signal of a map from currently held key names to their physical `event.code` values.

This is useful for debugging which physical key was pressed (e.g. distinguishing
left vs right Shift via "ShiftLeft" / "ShiftRight").

## Returns

Signal accessor for record mapping normalized key names to their `event.code` values

```ts
(): Record<string, string>;
```

### Returns

`Record`\<`string`, `string`\>

## Example

```tsx
function KeyDebugDisplay() {
  const heldKeys = createHeldKeys()
  const heldCodes = createHeldKeyCodes()

  return (
    <div>
      <For each={heldKeys()}>
        {(key) => (
          <kbd>
            {key} <small>{heldCodes()[key]}</small>
          </kbd>
        )}
      </For>
    </div>
  )
}
```
