/* @refresh reload */
import { render } from 'solid-js/web'
import { createSignal, Show, For } from 'solid-js'
import {
  formatForDisplay,
  createHeldKeys,
  createHotkeyRegistrations,
  createHotkeySequences,
  createHotkeySequenceRecorder,
  HotkeysProvider,
} from '@tanstack/solid-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/solid-devtools'
import type { HotkeySequence } from '@tanstack/solid-hotkeys'
import './index.css'

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

const INITIAL_SHORTCUTS: Array<Shortcut> = [
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
]

function App() {
  const [shortcuts, setShortcuts] =
    createSignal<Array<Shortcut>>(INITIAL_SHORTCUTS)

  // Track which shortcut is being edited
  const [editingId, setEditingId] = createSignal<string | null>(null)
  const [draftName, setDraftName] = createSignal('')
  const [draftDescription, setDraftDescription] = createSignal('')

  const recorder = createHotkeySequenceRecorder({
    onRecord: (sequence: HotkeySequence) => {
      const id = editingId()
      if (id) {
        setShortcuts((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  sequence,
                  name: draftName(),
                  description: draftDescription(),
                }
              : s,
          ),
        )
        setEditingId(null)
      }
    },
    onCancel: () => {
      const id = editingId()
      if (id) {
        setShortcuts((prev) => {
          const shortcut = prev.find((s) => s.id === id)
          if (shortcut && shortcut.sequence.length === 0) {
            return prev.filter((s) => s.id !== id)
          }
          return prev
        })
      }
      setEditingId(null)
    },
    onClear: () => {
      const id = editingId()
      if (id) {
        setShortcuts((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  sequence: [],
                  name: draftName(),
                  description: draftDescription(),
                }
              : s,
          ),
        )
        setEditingId(null)
      }
    },
  })

  // Register all sequences with meta
  createHotkeySequences(() =>
    shortcuts()
      .filter((s) => s.sequence.length > 0)
      .map((s) => ({
        sequence: s.sequence,
        callback: () => {
          console.log(`${s.name} triggered:`, s.sequence)
        },
        options: {
          enabled: !recorder.isRecording(),
          meta: {
            name: s.name,
            description: s.description,
          },
        },
      })),
  )

  const handleEdit = (id: string) => {
    const shortcut = shortcuts().find((s) => s.id === id)
    if (!shortcut) return
    setEditingId(id)
    setDraftName(shortcut.name)
    setDraftDescription(shortcut.description)
    recorder.startRecording()
  }

  const handleSaveEditing = () => {
    const id = editingId()
    if (id) {
      setShortcuts((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, name: draftName(), description: draftDescription() }
            : s,
        ),
      )
      recorder.stopRecording()
      setEditingId(null)
    }
  }

  const handleCancel = () => {
    recorder.cancelRecording()
    // onCancel callback handles cleanup
  }

  const handleDelete = (id: string) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id))
  }

  const handleCreateNew = () => {
    const newShortcut: Shortcut = {
      id: createId(),
      name: '',
      description: '',
      sequence: [],
    }
    setShortcuts((prev) => [...prev, newShortcut])
    setEditingId(newShortcut.id)
    setDraftName('')
    setDraftDescription('')
    recorder.startRecording()
  }

  return (
    <div class="app">
      <header>
        <h1>Sequence Shortcut Settings</h1>
        <p>
          Customize Vim-style sequences. Click Edit, press each chord in order,
          then press Enter to save. Escape cancels; Backspace removes the last
          chord or clears when empty.
        </p>
      </header>

      <main>
        <section class="demo-section">
          <h2>Shortcuts</h2>
          <div class="shortcuts-list">
            <For each={shortcuts()}>
              {(shortcut) => (
                <ShortcutListItem
                  shortcut={shortcut}
                  isEditing={editingId() === shortcut.id}
                  draftName={
                    editingId() === shortcut.id ? draftName() : shortcut.name
                  }
                  draftDescription={
                    editingId() === shortcut.id
                      ? draftDescription()
                      : shortcut.description
                  }
                  onDraftNameChange={setDraftName}
                  onDraftDescriptionChange={setDraftDescription}
                  liveSteps={recorder.steps()}
                  onEdit={() => handleEdit(shortcut.id)}
                  onSave={handleSaveEditing}
                  onCancel={handleCancel}
                  onDelete={() => handleDelete(shortcut.id)}
                />
              )}
            </For>
          </div>
          <button
            type="button"
            class="create-button"
            onClick={handleCreateNew}
            disabled={recorder.isRecording()}
          >
            + Create New Shortcut
          </button>
        </section>

        <Show when={recorder.isRecording()}>
          <div class="info-box recording-notice">
            <strong>Recording sequence...</strong> Press each chord, then Enter
            to finish. Escape cancels. Backspace removes the last chord or
            clears.
            <Show when={recorder.steps().length > 0}>
              <div>
                Steps:{' '}
                <For each={recorder.steps()}>
                  {(h, i) => (
                    <>
                      {i() > 0 && ' '}
                      <kbd>{formatForDisplay(h)}</kbd>
                    </>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </Show>

        <RegistrationsViewer />

        <section class="demo-section">
          <h2>Usage</h2>
          <pre class="code-block">{`import {
  createHotkeySequences,
  createHotkeySequenceRecorder,
  createHotkeyRegistrations,
} from '@tanstack/solid-hotkeys'

// Register sequences dynamically with meta
createHotkeySequences(() =>
  shortcuts().map((s) => ({
    sequence: s.sequence,
    callback: () => handleAction(s.id),
    options: {
      enabled: !recorder.isRecording(),
      meta: { name: s.name, description: s.description },
    },
  })),
)

// Read all registrations reactively
const { sequences } = createHotkeyRegistrations()
// sequences()[0].options.meta?.name → 'Save'
// sequences()[0].triggerCount → 3`}</pre>
        </section>
      </main>
      <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Live registrations viewer using createHotkeyRegistrations
// ---------------------------------------------------------------------------

function RegistrationsViewer() {
  const { sequences } = createHotkeyRegistrations()

  return (
    <section class="demo-section">
      <h2>Live Registrations</h2>
      <p>
        This table is powered by <code>createHotkeyRegistrations()</code> —
        trigger counts, names, and descriptions update in real-time as you use
        your sequences.
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
          <For each={sequences()}>
            {(reg) => (
              <tr>
                <td>
                  <For each={reg.sequence}>
                    {(s, i) => (
                      <>
                        {i() > 0 && ' '}
                        <kbd>{formatForDisplay(s)}</kbd>
                      </>
                    )}
                  </For>
                </td>
                <td>{reg.options.meta?.name ?? '\u2014'}</td>
                <td class="description-cell">
                  {reg.options.meta?.description ?? '\u2014'}
                </td>
                <td>
                  <span
                    class={
                      reg.options.enabled !== false ? 'status-on' : 'status-off'
                    }
                  >
                    {reg.options.enabled !== false ? 'yes' : 'no'}
                  </span>
                </td>
                <td class="trigger-count">{reg.triggerCount}</td>
              </tr>
            )}
          </For>
          <Show when={sequences().length === 0}>
            <tr>
              <td colSpan={5} class="empty-row">
                No sequences registered
              </td>
            </tr>
          </Show>
        </tbody>
      </table>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Shortcut list item with inline editing
// ---------------------------------------------------------------------------

function ShortcutListItem(props: {
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
}) {
  const heldKeys = createHeldKeys()

  return (
    <div class={`shortcut-item ${props.isEditing ? 'recording' : ''}`}>
      <div class="shortcut-item-content">
        <div class="shortcut-action">
          {props.isEditing ? (
            <div class="editing-fields">
              <input
                type="text"
                class="edit-input edit-name"
                value={props.draftName}
                onInput={(e) => props.onDraftNameChange(e.currentTarget.value)}
                placeholder="Shortcut name"
              />
              <input
                type="text"
                class="edit-input edit-description"
                value={props.draftDescription}
                onInput={(e) =>
                  props.onDraftDescriptionChange(e.currentTarget.value)
                }
                placeholder="Description (optional)"
              />
            </div>
          ) : (
            <>
              {props.shortcut.name || <span class="unnamed">Unnamed</span>}
              <Show when={props.shortcut.description}>
                <div class="shortcut-description">
                  {props.shortcut.description}
                </div>
              </Show>
            </>
          )}
        </div>
        <div class="shortcut-hotkey">
          {props.isEditing ? (
            <div class="recording-indicator">
              {props.liveSteps.length > 0 ? (
                <span class="held-hotkeys">
                  {props.liveSteps.map((h) => formatForDisplay(h)).join(' ')}
                </span>
              ) : heldKeys().length > 0 ? (
                <div class="held-hotkeys">
                  {heldKeys().flatMap((key, index) =>
                    index > 0
                      ? [<span class="plus">+</span>, <kbd>{key}</kbd>]
                      : [<kbd>{key}</kbd>],
                  )}
                </div>
              ) : (
                <span class="recording-text">Press chords, then Enter...</span>
              )}
            </div>
          ) : props.shortcut.sequence.length > 0 ? (
            <kbd>
              {props.shortcut.sequence
                .map((h) => formatForDisplay(h))
                .join(' ')}
            </kbd>
          ) : (
            <span class="no-shortcut">No shortcut</span>
          )}
        </div>
      </div>
      <div class="shortcut-actions">
        {props.isEditing ? (
          <>
            <button type="button" onClick={props.onSave} class="save-button">
              Save
            </button>
            <button
              type="button"
              onClick={props.onCancel}
              class="cancel-button"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={props.onEdit} class="edit-button">
              Edit
            </button>
            <button
              type="button"
              onClick={props.onDelete}
              class="delete-button"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const root = document.getElementById('root')!
render(
  () => (
    <HotkeysProvider>
      <App />
    </HotkeysProvider>
  ),
  root,
)
