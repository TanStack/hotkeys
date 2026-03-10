<script lang="ts">
  import { formatForDisplay, getHeldKeys } from '@tanstack/svelte-hotkeys'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'

  interface Props {
    actionName: string
    hotkey: string
    isRecording: boolean
    onEdit: () => void
    onCancel: () => void
  }

  let { actionName, hotkey, isRecording, onEdit, onCancel }: Props = $props()

  const heldKeys = getHeldKeys()
</script>

<div class="shortcut-item" class:recording={isRecording}>
  <div class="shortcut-item-content">
    <div class="shortcut-action">{actionName}</div>
    <div class="shortcut-hotkey">
      {#if isRecording}
        <div class="recording-indicator">
          {#if heldKeys.keys.length > 0}
            <div class="held-hotkeys">
              {#each heldKeys.keys as key, index}
                {#if index > 0}
                  <span class="plus">+</span>
                {/if}
                <kbd>{key}</kbd>
              {/each}
            </div>
          {:else}
            <span class="recording-text"> Press any key combination... </span>
          {/if}
        </div>
      {:else if hotkey}
        <kbd>{formatForDisplay(hotkey as Hotkey)}</kbd>
      {:else}
        <span class="no-shortcut">No shortcut</span>
      {/if}
    </div>
  </div>
  <div class="shortcut-actions">
    {#if isRecording}
      <button onclick={onCancel} class="cancel-button"> Cancel </button>
    {:else}
      <button onclick={onEdit} class="edit-button"> Edit </button>
    {/if}
  </div>
</div>
