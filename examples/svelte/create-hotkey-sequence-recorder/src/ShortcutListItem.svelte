<script lang="ts">
  import { formatForDisplay, getHeldKeys } from '@tanstack/svelte-hotkeys'
  import type { HotkeySequence } from '@tanstack/svelte-hotkeys'

  interface Props {
    actionName: string
    sequence: HotkeySequence
    disabled: boolean
    liveSteps: HotkeySequence
    isRecording: boolean
    onEdit: () => void
    onCancel: () => void
  }

  let {
    actionName,
    sequence,
    disabled,
    liveSteps,
    isRecording,
    onEdit,
    onCancel,
  }: Props = $props()

  const heldKeys = getHeldKeys()

  function formatSeq(seq: HotkeySequence): string {
    return seq.map((h) => formatForDisplay(h)).join(' ')
  }
</script>

<div class="shortcut-item" class:recording={isRecording}>
  <div class="shortcut-item-content">
    <div class="shortcut-action">{actionName}</div>
    <div class="shortcut-hotkey">
      {#if isRecording}
        <div class="recording-indicator">
          {#if liveSteps.length > 0}
            <span class="held-hotkeys">{formatSeq(liveSteps)}</span>
          {:else if heldKeys.keys.length > 0}
            <div class="held-hotkeys">
              {#each heldKeys.keys as key, index}
                {#if index > 0}
                  <span class="plus">+</span>
                {/if}
                <kbd>{key}</kbd>
              {/each}
            </div>
          {:else}
            <span class="recording-text">Press chords, then Enter…</span>
          {/if}
        </div>
      {:else if !disabled}
        <kbd>{formatSeq(sequence)}</kbd>
      {:else}
        <span class="no-shortcut">No shortcut</span>
      {/if}
    </div>
  </div>
  <div class="shortcut-actions">
    {#if isRecording}
      <button type="button" onclick={onCancel} class="cancel-button">
        Cancel
      </button>
    {:else}
      <button type="button" onclick={onEdit} class="edit-button">Edit</button>
    {/if}
  </div>
</div>
