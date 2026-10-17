<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'
  import { getActivity } from './activity.svelte'
  import CommentBox from './CommentBox.svelte'
  import Key from './Key.svelte'
  import Scope from './Scope.svelte'

  const activity = getActivity()
  let showComments = $state(true)
  createHotkey('Mod+S', () => activity.log('document', 'Document saved'))
</script>

<section class="demo-section">
  <h2>Nested scopes</h2>
  <p>
    The document and its comment box both register <Key hotkey="Mod+S" />. The
    comment box is nested, so it wins while it is mounted. Hide it and the
    document handles the key again.
  </p>
  <label>
    <input type="checkbox" bind:checked={showComments} />
    Show comment box
  </label>
  {#if showComments}
    <Scope scope="comments"><CommentBox /></Scope>
  {/if}
</section>
