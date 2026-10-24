---
id: createHotkeyScopesState
title: createHotkeyScopesState
---

```ts
function createHotkeyScopesState(): () => HotkeyScopesState;
```

Defined in: [createHotkeyScopesState.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeyScopesState.ts#L25)

SolidJS primitive that returns a signal of the hotkey manager's scope state:
the active scopes, the exclusive scope that owns the keyboard, and the
scopes it allows or suspends. Updates when scopes activate or release.

## Returns

Signal accessor for the current scope state

() => `HotkeyScopesState`

## Example

```tsx
function KeyboardOwner() {
  const scopes = createHotkeyScopesState()

  return (
    <Show when={scopes().exclusive}>
      {(exclusive) => <p>Shortcuts belong to {exclusive()}</p>}
    </Show>
  )
}
```
