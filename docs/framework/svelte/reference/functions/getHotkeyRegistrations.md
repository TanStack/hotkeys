---
id: getHotkeyRegistrations
title: getHotkeyRegistrations
---

# Function: getHotkeyRegistrations()

```ts
function getHotkeyRegistrations(): SvelteHotkeyRegistrations;
```

Defined in: [packages/svelte-hotkeys/src/getHotkeyRegistrations.svelte.ts:58](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getHotkeyRegistrations.svelte.ts#L58)

Svelte function that returns reactive access to all hotkey and sequence
registrations from the singleton managers.

This is a standalone function that does NOT require the HotkeysProvider.

## Returns

[`SvelteHotkeyRegistrations`](../interfaces/SvelteHotkeyRegistrations.md)

Object with reactive `hotkeys` and `sequences` properties

## Example

```svelte
<script>
  import { getHotkeyRegistrations } from '@tanstack/svelte-hotkeys'

  const registrations = getHotkeyRegistrations()
</script>
{#each registrations.hotkeys as reg}
  <div>{reg.options.meta?.name} — {reg.triggerCount} triggers</div>
{/each}
```
