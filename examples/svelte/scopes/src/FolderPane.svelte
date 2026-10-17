<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'
  import { getActivity } from './activity.svelte'

  let {
    name,
    current,
    onSelect,
  }: { name: string; current: boolean; onSelect: () => void } = $props()
  const activity = getActivity()
  let items = $state(0)
  createHotkey('Alt+[KeyN]', () => {
    items++
    activity.log(name.toLowerCase(), `Added to ${name}`)
  })
</script>

<button class="panel folder" data-current={current} onclick={onSelect}>
  <strong>{name}</strong>
  <span>{items} items</span>
</button>
