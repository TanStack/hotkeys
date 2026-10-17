<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'
  import { getActivity } from './activity.svelte'
  import Key from './Key.svelte'

  // Registered under the root provider, so it is in the `global` scope.
  const activity = getActivity()
  createHotkey('Alt+[KeyL]', () => activity.clear())
</script>

<section class="demo-section">
  <h2>Activity</h2>
  <p>
    <Key hotkey="Alt+L" /> clears the log. It is registered under the root provider,
    so it is in the <code>global</code> scope.
  </p>
  <div class="log">
    {#each activity.entries as entry (entry.id)}
      <div class="log-entry">
        <code class="log-scope">{entry.scope}</code>
        {entry.message}
      </div>
    {:else}
      <div class="hint">Press a hotkey above.</div>
    {/each}
  </div>
</section>
