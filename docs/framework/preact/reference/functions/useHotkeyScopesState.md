---
id: useHotkeyScopesState
title: useHotkeyScopesState
---

```ts
function useHotkeyScopesState(): HotkeyScopesState;
```

Defined in: [useHotkeyScopesState.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeyScopesState.ts#L21)

Preact hook that returns the hotkey manager's scope state: the active
scopes, the exclusive scope that owns the keyboard, and the scopes it
allows or suspends. Re-renders when scopes activate or release.

## Returns

`HotkeyScopesState`

The current scope state

## Example

```tsx
function KeyboardOwner() {
  const { exclusive } = useHotkeyScopesState()

  return exclusive ? <p>Shortcuts belong to {exclusive}</p> : null
}
```
