<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'
  import { getActivity } from './activity.svelte'
  import Key from './Key.svelte'

  // In its own scope, so a dialog can allow just this hotkey.
  const activity = getActivity()
  let opened = $state(0)
  createHotkey('Mod+K', () => {
    opened++
    activity.log('palette', 'Command palette opened')
  })
</script>

<section class="demo-section">
  <h2>Command palette</h2>
  <p>
    <Key hotkey="Mod+K" /> lives in its own <code>palette</code> scope, so an exclusive
    dialog can allow it without allowing everything else.
  </p>
  <div class="counter">Opened {opened} {opened === 1 ? 'time' : 'times'}</div>
</section>
