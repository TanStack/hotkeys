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

  const DEFAULT_SHORTCUT_ACTIONS = {
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
  } as const satisfies ShortcutActions

  let shortcuts = $state<Record<string, Hotkey | ''>>(
    Object.fromEntries(
      Object.entries(DEFAULT_SHORTCUT_ACTIONS).map(([id, action]) => [
        id,
        action.defaultHotkey,
      ]),
    ),
  )

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

  createHotkey(
    () => shortcuts.save || DEFAULT_SHORTCUT_ACTIONS.save.defaultHotkey,
    () => {
      console.log('Save triggered:', shortcuts.save)
      saveCount++
    },
    () => ({
      enabled: !recorder.isRecording && shortcuts.save !== '',
    }),
  )

  createHotkey(
    () => shortcuts.open || DEFAULT_SHORTCUT_ACTIONS.open.defaultHotkey,
    () => {
      console.log('Open triggered:', shortcuts.open)
      openCount++
    },
    () => ({
      enabled: !recorder.isRecording && shortcuts.open !== '',
    }),
  )

  createHotkey(
    () => shortcuts.new || DEFAULT_SHORTCUT_ACTIONS.new.defaultHotkey,
    () => {
      console.log('New triggered:', shortcuts.new)
      newCount++
    },
    () => ({
      enabled: !recorder.isRecording && shortcuts.new !== '',
    }),
  )

  createHotkey(
    () => shortcuts.close || DEFAULT_SHORTCUT_ACTIONS.close.defaultHotkey,
    () => {
      console.log('Close triggered:', shortcuts.close)
      closeCount++
    },
    () => ({
      enabled: !recorder.isRecording && shortcuts.close !== '',
    }),
  )

  createHotkey(
    () => shortcuts.undo || DEFAULT_SHORTCUT_ACTIONS.undo.defaultHotkey,
    () => {
      console.log('Undo triggered:', shortcuts.undo)
      undoCount++
    },
    () => ({
      enabled: !recorder.isRecording && shortcuts.undo !== '',
    }),
  )

  createHotkey(
    () => shortcuts.redo || DEFAULT_SHORTCUT_ACTIONS.redo.defaultHotkey,
    () => {
      console.log('Redo triggered:', shortcuts.redo)
      redoCount++
    },
    () => ({
      enabled: !recorder.isRecording && shortcuts.redo !== '',
    }),
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
      <pre class="code-block">{`import {
  createHotkey,
  createHotkeyRecorder,
  formatForDisplay,
} from '@tanstack/svelte-hotkeys'

let shortcuts = $state({
  save: 'Mod+K',
  open: 'Mod+E',
})

const recorder = createHotkeyRecorder({
  onRecord: (hotkey) => {
    shortcuts = { ...shortcuts, save: hotkey }
  },
})

// Register shortcuts dynamically
createHotkey(
  () => shortcuts.save,
  () => handleSave(),
  () => ({ enabled: !recorder.isRecording })
)

// In template:
// <kbd>{formatForDisplay(shortcuts.save)}</kbd>`}</pre>
    </section>
  </main>
</div>
