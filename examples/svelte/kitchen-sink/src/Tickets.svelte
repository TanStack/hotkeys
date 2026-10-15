<script lang="ts">
  import { getContext } from 'svelte'
  import { createHotkey } from '@tanstack/svelte-hotkeys'
  import Hint from './Hint.svelte'
  const log = getContext<(message: string) => void>('log')
  let count = $state(0),
    enabled = $state(true)
  const create = () => {
    count++
    log('Ticket created')
  }
  const save = () => log('Ticket saved')
  createHotkey('Alt+[KeyC]', create, () => ({
    enabled: enabled,
    ignoreInputs: false,
    meta: { name: 'Create ticket', group: 'Tickets' },
  }))
  createHotkey('Alt+[KeyS]', save, () => ({
    enabled: enabled,
    meta: { name: 'Save ticket', group: 'Tickets' },
  }))
</script>

<section>
  <h2>Tickets</h2>
  <p>Created: {count}. Buttons and shortcuts share handlers.</p>
  <label
    ><input type="checkbox" bind:checked={enabled} /> Enable ticket actions</label
  ><button disabled={!enabled} onclick={create}
    >Create ticket <Hint hotkey="Alt+[KeyC]" {enabled} /></button
  ><button disabled={!enabled} onclick={save}
    >Save pending <Hint hotkey="Alt+[KeyS]" {enabled} /></button
  ><label>Ticket note <input placeholder="Try Alt + C while typing" /></label>
  <p>
    Create uses ignoreInputs: false. Save uses default filtering. Release before
    firing again.
  </p>
</section>
