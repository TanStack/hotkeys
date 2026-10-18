<script lang="ts">
  import { createHotkey } from '@tanstack/svelte-hotkeys'
  import Key from './Key.svelte'
  import Scope from './Scope.svelte'
  import ScopeFrame from './ScopeFrame.svelte'
  import Steps from './Steps.svelte'
  import type { Attachment } from 'svelte/attachments'
  import type { ExclusiveOption } from './activity.svelte'

  let {
    exclusive,
    onClose,
    onSave,
  }: {
    exclusive: ExclusiveOption
    onClose: () => void
    onSave: () => void
  } = $props()
  createHotkey('Escape', () => onClose())
  createHotkey('Mod+S', () => onSave())

  // Moved to the body, outside the boxes above. The scope still comes from
  // the provider around this component, not from where it renders.
  const portal: Attachment = (node) => {
    document.body.append(node)
    return () => node.remove()
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="backdrop" onclick={onClose} {@attach portal}>
  <div
    class="dialog"
    role="dialog"
    aria-modal="true"
    aria-label="Exclusive dialog"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
  >
    <ScopeFrame scope="dialog" {exclusive}>
      <h2>Exclusive dialog</h2>
      <p>
        <Key hotkey="Mod+S" /> saves this dialog instead of the document.
        <Key hotkey="Escape" /> closes it. The folder hotkeys are suspended, and so
        is anything you did not allow above.
      </p>
      <Scope scope="dialog-steps"><Steps /></Scope>
      <div class="actions">
        <button class="secondary" onclick={onClose}>Cancel</button>
        <button onclick={onSave}>Save</button>
      </div>
    </ScopeFrame>
  </div>
</div>
