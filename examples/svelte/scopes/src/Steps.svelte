<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'
  import { getActivity } from './activity.svelte'
  import Key from './Key.svelte'

  // Nested in the exclusive scope, so it stays active without being allowed.
  const activity = getActivity()
  let step = $state(1)
  createHotkey('Alt+[KeyN]', () => {
    step = (step % 3) + 1
    activity.log('dialog-steps', 'Next step')
  })
</script>

<div class="panel">
  Step {step} of 3. <Key hotkey="Alt+N" /> moves to the next step. It is in the nested
  <code>dialog-steps</code> scope, so it still works, and it takes the key from the
  suspended folders.
</div>
