<script lang="ts">
  import {
    createHotkeys,
    createHotkeyRecorder,
    formatForDisplay,
    getHotkeyRegistrations,
  } from '@tanstack/svelte-hotkeys'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'
  import ShortcutListItem from './ShortcutListItem.svelte'

  interface Shortcut {
    id: string
    name: string
    description: string
    hotkey: Hotkey | ''
  }

  let nextId = 0
  function createId(): string {
    return `shortcut_${++nextId}`
  }

  let shortcuts = $state<Array<Shortcut>>([
    {
      id: createId(),
      name: 'Save',
      description: 'Save the current document',
      hotkey: 'Mod+K',
    },
    {
      id: createId(),
      name: 'Open',
      description: 'Open a file from disk',
      hotkey: 'Mod+E',
    },
    {
      id: createId(),
      name: 'New',
      description: 'Create a new document',
      hotkey: 'Mod+G',
    },
    {
      id: createId(),
      name: 'Close',
      description: 'Close the current tab',
      hotkey: 'Mod+Shift+K',
    },
    {
      id: createId(),
      name: 'Undo',
      description: 'Undo the last action',
      hotkey: 'Mod+Shift+E',
    },
    {
      id: createId(),
      name: 'Redo',
      description: 'Redo the last undone action',
      hotkey: 'Mod+Shift+G',
    },
  ])

  let editingId = $state<string | null>(null)
  let draftName = $state('')
  let draftDescription = $state('')

  const recorder = createHotkeyRecorder({
    onRecord: (hotkey: Hotkey) => {
      if (editingId) {
        shortcuts = shortcuts.map((s) =>
          s.id === editingId
            ? { ...s, hotkey, name: draftName, description: draftDescription }
            : s,
        )
        editingId = null
      }
    },
    onCancel: () => {
      if (editingId) {
        const shortcut = shortcuts.find((s) => s.id === editingId)
        if (shortcut && shortcut.hotkey === '') {
          shortcuts = shortcuts.filter((s) => s.id !== editingId)
        }
      }
      editingId = null
    },
    onClear: () => {
      if (editingId) {
        shortcuts = shortcuts.map((s) =>
          s.id === editingId
            ? {
                ...s,
                hotkey: '' as Hotkey | '',
                name: draftName,
                description: draftDescription,
              }
            : s,
        )
        editingId = null
      }
    },
  })

  let isRecording = $derived(recorder.isRecording)

  // Register all shortcuts with meta
  createHotkeys(() =>
    shortcuts
      .filter((s) => s.hotkey !== '')
      .map((s) => ({
        hotkey: s.hotkey as Hotkey,
        callback: () => {
          console.log(`${s.name} triggered:`, s.hotkey)
        },
        options: {
          enabled: !isRecording,
          meta: {
            name: s.name,
            description: s.description,
          },
        },
      })),
  )

  function handleEdit(id: string) {
    const shortcut = shortcuts.find((s) => s.id === id)
    if (!shortcut) return
    editingId = id
    draftName = shortcut.name
    draftDescription = shortcut.description
    recorder.startRecording()
  }

  function handleSaveEditing() {
    if (editingId) {
      shortcuts = shortcuts.map((s) =>
        s.id === editingId
          ? { ...s, name: draftName, description: draftDescription }
          : s,
      )
      recorder.stopRecording()
      editingId = null
    }
  }

  function handleCancel() {
    recorder.cancelRecording()
  }

  function handleDelete(id: string) {
    shortcuts = shortcuts.filter((s) => s.id !== id)
  }

  function handleCreateNew() {
    const newShortcut: Shortcut = {
      id: createId(),
      name: '',
      description: '',
      hotkey: '',
    }
    shortcuts = [...shortcuts, newShortcut]
    editingId = newShortcut.id
    draftName = ''
    draftDescription = ''
    recorder.startRecording()
  }

  // Registrations viewer
  const registrations = getHotkeyRegistrations()
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
        {#each shortcuts as shortcut (shortcut.id)}
          <ShortcutListItem
            {shortcut}
            isEditing={editingId === shortcut.id}
            draftName={editingId === shortcut.id ? draftName : shortcut.name}
            draftDescription={editingId === shortcut.id
              ? draftDescription
              : shortcut.description}
            onDraftNameChange={(v) => (draftName = v)}
            onDraftDescriptionChange={(v) => (draftDescription = v)}
            onEdit={() => handleEdit(shortcut.id)}
            onSave={handleSaveEditing}
            onCancel={handleCancel}
            onDelete={() => handleDelete(shortcut.id)}
          />
        {/each}
      </div>
      <button
        type="button"
        class="create-button"
        onclick={handleCreateNew}
        disabled={isRecording}
      >
        + Create New Shortcut
      </button>
    </section>

    {#if recorder.isRecording}
      <div class="info-box recording-notice">
        <strong>Recording shortcut...</strong> Press any key combination or Escape
        to cancel. Press Backspace/Delete to clear the shortcut.
      </div>
    {/if}

    <!-- Registrations Viewer -->
    <section class="demo-section">
      <h2>Live Registrations</h2>
      <p>
        This table is powered by <code>getHotkeyRegistrations()</code> — trigger counts,
        names, and descriptions update in real-time as you use your shortcuts.
      </p>
      <table class="registrations-table">
        <thead>
          <tr>
            <th>Hotkey</th>
            <th>Name</th>
            <th>Description</th>
            <th>Enabled</th>
            <th>Triggers</th>
          </tr>
        </thead>
        <tbody>
          {#each registrations.hotkeys as reg (reg.id)}
            <tr>
              <td>
                <kbd>{formatForDisplay(reg.hotkey)}</kbd>
              </td>
              <td>{reg.options.meta?.name ?? '—'}</td>
              <td class="description-cell">
                {reg.options.meta?.description ?? '—'}
              </td>
              <td>
                <span
                  class={reg.options.enabled !== false
                    ? 'status-on'
                    : 'status-off'}
                >
                  {reg.options.enabled !== false ? 'yes' : 'no'}
                </span>
              </td>
              <td class="trigger-count">{reg.triggerCount}</td>
            </tr>
          {/each}
          {#if registrations.hotkeys.length === 0}
            <tr>
              <td colspan="5" class="empty-row">No hotkeys registered</td>
            </tr>
          {/if}
        </tbody>
      </table>
    </section>

    <section class="demo-section">
      <h2>Usage</h2>
      <pre class="code-block">{`import {
  createHotkeys,
  createHotkeyRecorder,
  getHotkeyRegistrations,
} from '@tanstack/svelte-hotkeys'

// Register shortcuts dynamically with meta
createHotkeys(() =>
  shortcuts.map((s) => ({
    hotkey: s.hotkey,
    callback: () => handleAction(s.id),
    options: {
      enabled: !isRecording,
      meta: { name: s.name, description: s.description },
    },
  })),
)

// Read all registrations reactively
const registrations = getHotkeyRegistrations()
// registrations.hotkeys[0].options.meta?.name → 'Save'
// registrations.hotkeys[0].triggerCount → 3`}</pre>
    </section>
  </main>
</div>
