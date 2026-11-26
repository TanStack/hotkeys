<script lang="ts">
  import { getFormatForDisplay, getHeldKeys } from '@tanstack/svelte-hotkeys'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'
  import type { Shortcut } from './types'

  interface Props {
    shortcut: Shortcut
    isEditing: boolean
    draftName: string
    draftDescription: string
    onDraftNameChange: (value: string) => void
    onDraftDescriptionChange: (value: string) => void
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
    onEdit,
    onSave,
    onCancel,
    onDelete,
  }: Props = $props()

  const MODIFIER_ORDER = ['Control', 'Alt', 'Shift', 'Meta']

  const formatForDisplay = getFormatForDisplay()
  const heldKeys = getHeldKeys()
  // Held modifiers in chord order, with platform labels: ⌃ ⌥ ⇧ ⌘ on macOS,
  // Ctrl Alt Shift Win elsewhere. The next other key ends the recording.
  const heldModifiers = $derived(
    heldKeys.keys
      .filter((key) => MODIFIER_ORDER.includes(key))
      .sort((a, b) => MODIFIER_ORDER.indexOf(a) - MODIFIER_ORDER.indexOf(b)),
  )
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
          {#if heldModifiers.length > 0}
            <div class="held-hotkeys">
              {#each heldModifiers as key, index}
                {#if index > 0}
                  <span class="plus">+</span>
                {/if}
                <kbd>{formatForDisplay({ key })}</kbd>
              {/each}
            </div>
          {:else}
            <span class="recording-text">Press any key combination...</span>
          {/if}
        </div>
      {:else if shortcut.hotkey}
        <kbd>{formatForDisplay(shortcut.hotkey as Hotkey)}</kbd>
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
