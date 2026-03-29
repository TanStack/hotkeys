<script lang="ts">
  import { formatForDisplay, getHeldKeys } from '@tanstack/svelte-hotkeys'
  import type { HotkeySequence } from '@tanstack/svelte-hotkeys'

  interface Shortcut {
    id: string
    name: string
    description: string
    sequence: HotkeySequence
  }

  interface Props {
    shortcut: Shortcut
    isEditing: boolean
    draftName: string
    draftDescription: string
    onDraftNameChange: (value: string) => void
    onDraftDescriptionChange: (value: string) => void
    liveSteps: HotkeySequence
    onEdit: () => void
    onSave: () => void
    onCancel: () => void
    onDelete: () => void
  }

  let {
    shortcut,
    isEditing,
    draftName,
    draftDescription,
    onDraftNameChange,
    onDraftDescriptionChange,
    liveSteps,
    onEdit,
    onSave,
    onCancel,
    onDelete,
  }: Props = $props()

  const heldKeys = getHeldKeys()

  function formatSeq(seq: HotkeySequence): string {
    return seq.map((h) => formatForDisplay(h)).join(' ')
  }
</script>

<div class="shortcut-item" class:recording={isEditing}>
  <div class="shortcut-item-content">
    <div class="shortcut-action">
      {#if isEditing}
        <div class="editing-fields">
          <input
            type="text"
            class="edit-input edit-name"
            value={draftName}
            oninput={(e) => onDraftNameChange(e.currentTarget.value)}
            placeholder="Shortcut name"
          />
          <input
            type="text"
            class="edit-input edit-description"
            value={draftDescription}
            oninput={(e) => onDraftDescriptionChange(e.currentTarget.value)}
            placeholder="Description (optional)"
          />
        </div>
      {:else}
        {#if shortcut.name}
          {shortcut.name}
        {:else}
          <span class="unnamed">Unnamed</span>
        {/if}
        {#if shortcut.description}
          <div class="shortcut-description">{shortcut.description}</div>
        {/if}
      {/if}
    </div>
    <div class="shortcut-hotkey">
      {#if isEditing}
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
            <span class="recording-text">Press chords, then Enter...</span>
          {/if}
        </div>
      {:else if shortcut.sequence.length > 0}
        <kbd>{formatSeq(shortcut.sequence)}</kbd>
      {:else}
        <span class="no-shortcut">No shortcut</span>
      {/if}
    </div>
  </div>
  <div class="shortcut-actions">
    {#if isEditing}
      <button type="button" onclick={onSave} class="save-button">Save</button>
      <button type="button" onclick={onCancel} class="cancel-button">
        Cancel
      </button>
    {:else}
      <button type="button" onclick={onEdit} class="edit-button">Edit</button>
      <button type="button" onclick={onDelete} class="delete-button">
        Delete
      </button>
    {/if}
  </div>
</div>
