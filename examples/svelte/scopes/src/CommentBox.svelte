<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'
  import { getActivity } from './activity.svelte'

  const activity = getActivity()
  let comments = $state(0)
  createHotkey('Mod+S', () => {
    comments++
    activity.log('comments', 'Comment posted')
  })
</script>

<div class="panel">
  <strong>Comments</strong>
  <p>{comments} posted</p>
</div>
