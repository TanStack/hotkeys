<script lang="ts">
  import { getContext } from 'svelte'
  import {
    createHotkeysAttachment,
    formatForDisplay,
  } from '@tanstack/svelte-hotkeys'
  let { name }: { name: string } = $props()
  const log = getContext<(message: string) => void>('log')
  let text = $state('One shortcut, two independent editors.'),
    saves = $state(0)
  const shortcuts = createHotkeysAttachment(
    () => [
      {
        hotkey: 'Mod+[KeyS]',
        callback: () => {
          saves++
          log(`${name} saved`)
        },
        options: { meta: { name: `Save ${name}`, group: 'Editor' } },
      },
      {
        hotkey: 'Alt+[Backspace]',
        callback: () => {
          text = ''
        },
        options: { meta: { name: `Clear ${name}`, group: 'Editor' } },
      },
    ],
    { ignoreInputs: false },
  )
</script>

<fieldset {@attach shortcuts}>
  <legend>{name} — {saves} saves</legend><label
    >Editor content<textarea rows="3" bind:value={text}></textarea></label
  >
  <p>
    <kbd>{formatForDisplay('Mod+[KeyS]')}</kbd> Save;
    <kbd>{formatForDisplay('Alt+[Backspace]')}</kbd> Clear
  </p>
</fieldset>
