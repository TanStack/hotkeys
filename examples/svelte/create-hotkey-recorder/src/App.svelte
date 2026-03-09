<script lang="ts">
  import {
    createHotkey,
    createHotkeyRecorder,
    formatForDisplay,
  } from '@tanstack/svelte-hotkeys'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'
  import ShortcutListItem from './ShortcutListItem.svelte'

  interface ShortcutActions {
    [key: string]: {
      name: string
      defaultHotkey: Hotkey
    }
  }

  const DEFAULT_SHORTCUT_ACTIONS: ShortcutActions = {
    save: {
      name: 'Save',
      defaultHotkey: 'Mod+K',
    },
    open: {
      name: 'Open',
      defaultHotkey: 'Mod+E',
    },
    new: {
      name: 'New',
      defaultHotkey: 'Mod+G',
    },
    close: {
      name: 'Close',
      defaultHotkey: 'Mod+Shift+K',
    },
    undo: {
      name: 'Undo',
      defaultHotkey: 'Mod+Shift+E',
    },
    redo: {
      name: 'Redo',
      defaultHotkey: 'Mod+Shift+G',
    },
  }

  let shortcuts = $state<Record<string, Hotkey | ''>>(() => {
    const defaults: Record<string, Hotkey> = {}
    for (const [id, action] of Object.entries(DEFAULT_SHORTCUT_ACTIONS)) {
      defaults[id] = action.defaultHotkey
    }
    return defaults
  })

  let saveCount = $state(0)
  let openCount = $state(0)
  let newCount = $state(0)
  let closeCount = $state(0)
  let undoCount = $state(0)
  let redoCount = $state(0)

  let recordingActionId = $state<string | null>(null)

  const recorder = createHotkeyRecorder({
    onRecord: (hotkey: Hotkey) => {
      if (recordingActionId) {
        shortcuts = {
          ...shortcuts,
          [recordingActionId]: hotkey || ('' as Hotkey | ''),
        }
        recordingActionId = null
      }
    },
    onCancel: () => {
      recordingActionId = null
    },
    onClear: () => {
      if (recordingActionId) {
        shortcuts = {
          ...shortcuts,
          [recordingActionId]: '' as Hotkey | '',
        }
        recordingActionId = null
      }
    },
  })

  const isRecording = recorder.isRecording

  const saveHotkey: Hotkey =
    shortcuts.save || DEFAULT_SHORTCUT_ACTIONS.save.defaultHotkey
  const openHotkey: Hotkey =
    shortcuts.open || DEFAULT_SHORTCUT_ACTIONS.open.defaultHotkey
  const newHotkey: Hotkey =
    shortcuts.new || DEFAULT_SHORTCUT_ACTIONS.new.defaultHotkey
  const closeHotkey: Hotkey =
    shortcuts.close || DEFAULT_SHORTCUT_ACTIONS.close.defaultHotkey
  const undoHotkey: Hotkey =
    shortcuts.undo || DEFAULT_SHORTCUT_ACTIONS.undo.defaultHotkey
  const redoHotkey: Hotkey =
    shortcuts.redo || DEFAULT_SHORTCUT_ACTIONS.redo.defaultHotkey

  createHotkey(
    saveHotkey,
    () => {
      console.log('Save triggered:', saveHotkey)
      saveCount++
    },
    {
      enabled: !isRecording && shortcuts.save !== '',
    },
  )

  createHotkey(
    openHotkey,
    () => {
      console.log('Open triggered:', openHotkey)
      openCount++
    },
    {
      enabled: !isRecording && shortcuts.open !== '',
    },
  )

  createHotkey(
    newHotkey,
    () => {
      console.log('New triggered:', newHotkey)
      newCount++
    },
    {
      enabled: !isRecording && shortcuts.new !== '',
    },
  )

  createHotkey(
    closeHotkey,
    () => {
      console.log('Close triggered:', closeHotkey)
      closeCount++
    },
    {
      enabled: !isRecording && shortcuts.close !== '',
    },
  )

  createHotkey(
    undoHotkey,
    () => {
      console.log('Undo triggered:', undoHotkey)
      undoCount++
    },
    {
      enabled: !isRecording && shortcuts.undo !== '',
    },
  )

  createHotkey(
    redoHotkey,
    () => {
      console.log('Redo triggered:', redoHotkey)
      redoCount++
    },
    {
      enabled: !isRecording && shortcuts.redo !== '',
    },
  )

  function handleEdit(actionId: string) {
    recordingActionId = actionId
    recorder.startRecording()
  }

  function handleCancel() {
    recorder.cancelRecording()
    recordingActionId = null
  }
</script>

<div class="app">
  <header>
    <h1>Keyboard Shortcuts Settings</h1>
    <p>
      Customize your keyboard shortcuts. Click "Edit" to record a new shortcut,
      or press Escape to cancel.
    </p>
  </header>

  <main>
    <section class="demo-section">
      <h2>Shortcuts</h2>
      <div class="shortcuts-list">
        {#each Object.entries(DEFAULT_SHORTCUT_ACTIONS) as [actionId, action]}
          <ShortcutListItem
            actionName={action.name}
            hotkey={shortcuts[actionId] || ''}
            isRecording={recorder.isRecording && recordingActionId === actionId}
            onEdit={() => handleEdit(actionId)}
            onCancel={handleCancel}
          />
        {/each}
      </div>
    </section>

    <section class="demo-section">
      <h2>Demo Actions</h2>
      <p>Try your shortcuts! Actions will trigger when you press them.</p>
      <div class="demo-stats">
        <div class="stat-item">
          <div class="stat-label">Save</div>
          <div class="stat-value">{saveCount}</div>
          <kbd>{formatForDisplay(shortcuts.save || 'Mod+K')}</kbd>
        </div>
        <div class="stat-item">
          <div class="stat-label">Open</div>
          <div class="stat-value">{openCount}</div>
          <kbd>{formatForDisplay(shortcuts.open || 'Mod+E')}</kbd>
        </div>
        <div class="stat-item">
          <div class="stat-label">New</div>
          <div class="stat-value">{newCount}</div>
          <kbd>{formatForDisplay(shortcuts.new || 'Mod+G')}</kbd>
        </div>
        <div class="stat-item">
          <div class="stat-label">Close</div>
          <div class="stat-value">{closeCount}</div>
          <kbd>{formatForDisplay(shortcuts.close || 'Mod+Shift+K')}</kbd>
        </div>
        <div class="stat-item">
          <div class="stat-label">Undo</div>
          <div class="stat-value">{undoCount}</div>
          <kbd>{formatForDisplay(shortcuts.undo || 'Mod+Shift+E')}</kbd>
        </div>
        <div class="stat-item">
          <div class="stat-label">Redo</div>
          <div class="stat-value">{redoCount}</div>
          <kbd>{formatForDisplay(shortcuts.redo || 'Mod+Shift+G')}</kbd>
        </div>
      </div>
    </section>

    {#if recorder.isRecording}
      <div class="info-box recording-notice">
        <strong>Recording shortcut...</strong> Press any key combination or Escape
        to cancel. Press Backspace/Delete to clear the shortcut.
      </div>
    {/if}

    <section class="demo-section">
      <h2>Usage</h2>
      <pre
        class="code-block">{`import { createHotkey, formatForDisplay } from '@tanstack/svelte-hotkeys'

let shortcuts = $state({
  save: 'Mod+K',
  open: 'Mod+E',
})

// Register shortcuts dynamically
createHotkey(
  shortcuts.save,
  () => handleSave(),
  { enabled: !isRecording }
)

// In template:
// <kbd>{formatForDisplay(shortcuts.save)}</kbd>`}</pre>
    </section>
  </main>
</div>
