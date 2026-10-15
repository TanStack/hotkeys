---
id: getHotkeyRegistrations
title: getHotkeyRegistrations
---

```ts
function getHotkeyRegistrations(): SvelteHotkeyRegistrations;
```

Defined in: [packages/svelte-hotkeys/src/getHotkeyRegistrations.svelte.ts:39](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/getHotkeyRegistrations.svelte.ts#L39)

Svelte function that returns reactive access to every hotkey registration,
chords and sequences, from the singleton HotkeyManager.

This function does NOT require the HotkeysProvider.

## Returns

[`SvelteHotkeyRegistrations`](../interfaces/SvelteHotkeyRegistrations.md)

## Example

```svelte
<script lang="ts">
  const registrations = getHotkeyRegistrations()
</script>

{#each registrations.hotkeys as reg (reg.id)}
  <li>{reg.options.meta?.name}: {formatForDisplay(reg.hotkey)}</li>
{/each}
```
