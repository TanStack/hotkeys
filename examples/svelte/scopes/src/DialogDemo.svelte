<script lang="ts">
  import { HotkeysProvider, createHotkey } from '@tanstack/svelte-hotkeys'
  import { getActivity } from './activity.svelte'
  import ExclusiveDialog from './ExclusiveDialog.svelte'
  import Key from './Key.svelte'
  import type { ExclusiveOption } from './activity.svelte'

  // `exclusive` suspends every other scope, except the ones it allows.
  const allowOptions = ['global', 'palette'] as const
  const activity = getActivity()
  let open = $state(false)
  let allow = $state<Array<string>>(['palette'])
  createHotkey('Alt+[KeyD]', () => (open = true))

  const exclusive: ExclusiveOption = $derived(
    allow.length > 0 ? { allow } : true,
  )

  function save() {
    activity.log('dialog', 'Dialog saved')
    open = false
  }
</script>

<section class="demo-section">
  <h2>Exclusive scopes</h2>
  <p>
    An exclusive provider suspends every other scope while it is mounted,
    including <code>global</code>. Scopes nested inside it keep working. List
    scopes in <code>allow</code> to keep them working too.
  </p>
  <fieldset>
    <legend>Allow while the dialog is open</legend>
    {#each allowOptions as scope (scope)}
      <label>
        <input type="checkbox" value={scope} bind:group={allow} />
        <code>{scope}</code>
      </label>
    {/each}
  </fieldset>
  <button onclick={() => (open = true)}>
    Open dialog <Key hotkey="Alt+D" />
  </button>
  {#if open}
    <HotkeysProvider scope="dialog" {exclusive}>
      <ExclusiveDialog
        {exclusive}
        onClose={() => (open = false)}
        onSave={save}
      />
    </HotkeysProvider>
  {/if}
</section>
