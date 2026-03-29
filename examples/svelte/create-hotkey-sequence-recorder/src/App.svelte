<script lang="ts">
  import {
    createHotkeySequences,
    createHotkeySequenceRecorder,
    formatForDisplay,
    getHotkeyRegistrations,
  } from '@tanstack/svelte-hotkeys'
  import type { HotkeySequence } from '@tanstack/svelte-hotkeys'
  import ShortcutListItem from './ShortcutListItem.svelte'

  interface Shortcut {
    id: string
    name: string
    description: string
    sequence: HotkeySequence
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
      sequence: ['Mod+S'],
    },
    {
      id: createId(),
      name: 'Open (gg)',
      description: 'Open the file browser',
      sequence: ['G', 'G'],
    },
    {
      id: createId(),
      name: 'New (dd)',
      description: 'Create a new document',
      sequence: ['D', 'D'],
    },
    {
      id: createId(),
      name: 'Close',
      description: 'Close the current tab',
      sequence: ['Mod+Shift+K'],
    },
    {
      id: createId(),
      name: 'Undo (yy)',
      description: 'Undo the last action',
      sequence: ['Y', 'Y'],
    },
    {
      id: createId(),
      name: 'Redo',
      description: 'Redo the last undone action',
      sequence: ['Mod+Shift+G'],
    },
  ])

  let editingId = $state<string | null>(null)
  let draftName = $state('')
  let draftDescription = $state('')

  const recorder = createHotkeySequenceRecorder({
    onRecord: (sequence: HotkeySequence) => {
      if (editingId) {
        shortcuts = shortcuts.map((s) =>
          s.id === editingId
            ? {
                ...s,
                sequence,
                name: draftName,
                description: draftDescription,
              }
            : s,
        )
        editingId = null
      }
    },
    onCancel: () => {
      if (editingId) {
        const shortcut = shortcuts.find((s) => s.id === editingId)
        if (shortcut && shortcut.sequence.length === 0) {
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
                sequence: [],
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

  // Register all sequences with meta
  createHotkeySequences(() =>
    shortcuts
      .filter((s) => s.sequence.length > 0)
      .map((s) => ({
        sequence: s.sequence,
        callback: () => {
          console.log(`${s.name} triggered:`, s.sequence)
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
      sequence: [],
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
    <h1>Sequence Shortcut Settings</h1>
    <p>
      Customize Vim-style sequences. Click Edit, press each chord in order, then
      press Enter to save. Escape cancels; Backspace removes the last chord or
      clears when empty.
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
            liveSteps={recorder.steps}
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
        <strong>Recording sequence...</strong> Press each chord, then Enter to
        finish. Escape cancels. Backspace removes the last chord or clears.
        {#if recorder.steps.length > 0}
          <div>
            Steps:
            {#each recorder.steps as h, i}
              {#if i > 0}{' '}{/if}<kbd>{formatForDisplay(h)}</kbd>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Registrations Viewer -->
    <section class="demo-section">
      <h2>Live Registrations</h2>
      <p>
        This table is powered by <code>getHotkeyRegistrations()</code> — trigger counts,
        names, and descriptions update in real-time as you use your sequences.
      </p>
      <table class="registrations-table">
        <thead>
          <tr>
            <th>Sequence</th>
            <th>Name</th>
            <th>Description</th>
            <th>Enabled</th>
            <th>Triggers</th>
          </tr>
        </thead>
        <tbody>
          {#each registrations.sequences as reg (reg.id)}
            <tr>
              <td>
                {#each reg.sequence as s, i}
                  {#if i > 0}{' '}{/if}<kbd>{formatForDisplay(s)}</kbd>
                {/each}
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
          {#if registrations.sequences.length === 0}
            <tr>
              <td colspan="5" class="empty-row">No sequences registered</td>
            </tr>
          {/if}
        </tbody>
      </table>
    </section>

    <section class="demo-section">
      <h2>Usage</h2>
      <pre class="code-block">{`import {
  createHotkeySequences,
  createHotkeySequenceRecorder,
  getHotkeyRegistrations,
} from '@tanstack/svelte-hotkeys'

// Register sequences dynamically with meta
createHotkeySequences(() =>
  shortcuts.map((s) => ({
    sequence: s.sequence,
    callback: () => handleAction(s.id),
    options: {
      enabled: !isRecording,
      meta: { name: s.name, description: s.description },
    },
  })),
)

// Read all registrations reactively
const registrations = getHotkeyRegistrations()
// registrations.sequences[0].options.meta?.name → 'Save'
// registrations.sequences[0].triggerCount → 3`}</pre>
    </section>
  </main>
</div>
