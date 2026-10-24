---
id: getHotkeyScopesState
title: getHotkeyScopesState
---

```ts
function getHotkeyScopesState(): SvelteHotkeyScopesState;
```

Defined in: [packages/svelte-hotkeys/src/getHotkeyScopesState.svelte.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getHotkeyScopesState.svelte.ts#L38)

Svelte function that returns reactive access to the hotkey manager's scope
state: the active scopes, the exclusive scope that owns the keyboard, and
the scopes it allows or suspends. Updates when scopes activate or release.

## Returns

[`SvelteHotkeyScopesState`](../interfaces/SvelteHotkeyScopesState.md)

Object with a reactive `state` property

## Example

```svelte
<script>
  import { getHotkeyScopesState } from '@tanstack/svelte-hotkeys'

  const scopes = getHotkeyScopesState()
</script>
{#if scopes.state.exclusive}
  <p>Shortcuts belong to {scopes.state.exclusive}</p>
{/if}
```
