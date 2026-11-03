<script lang="ts">
  import { createHotkeyAttachment } from '../src/createHotkey.svelte'

  let {
    log,
    childStops = false,
  }: { log: Array<string>; childStops?: boolean } = $props()
</script>

<div
  tabindex="0"
  onkeydown={() => log.push('panel')}
  {@attach createHotkeyAttachment('Escape', () => log.push('hotkey'))}
>
  <input
    role="combobox"
    aria-expanded="true"
    data-testid="child"
    onkeydown={(event) => {
      log.push('child')
      if (childStops) event.stopPropagation()
    }}
  />
</div>
