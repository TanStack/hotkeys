/* @refresh reload */
import { render } from 'solid-js/web'
import { createSignal, Show, For } from 'solid-js'
import {
  formatForDisplay,
  createHeldKeys,
  createHotkeyRecorder,
  createHotkeys,
  createHotkeyRegistrations,
  HotkeysProvider,
} from '@tanstack/solid-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/solid-devtools'
import type { Hotkey } from '@tanstack/solid-hotkeys'
import './index.css'

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

const INITIAL_SHORTCUTS: Array<Shortcut> = [
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
]

function App() {
  const [shortcuts, setShortcuts] =
    createSignal<Array<Shortcut>>(INITIAL_SHORTCUTS)

  // Track which shortcut is being edited (recording + name/description editing)
  const [editingId, setEditingId] = createSignal<string | null>(null)
  // Draft name/description while editing
  const [draftName, setDraftName] = createSignal('')
  const [draftDescription, setDraftDescription] = createSignal('')

  const recorder = createHotkeyRecorder({
    onRecord: (hotkey: Hotkey) => {
      const id = editingId()
      if (id) {
        setShortcuts((prev) =>
          prev.map((s) =>
            s.id === id
              ? {
                  ...s,
                  hotkey,
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
          if (shortcut && shortcut.hotkey === '') {
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
                  hotkey: '' as Hotkey | '',
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

  // Register all shortcuts with meta
  createHotkeys(() =>
    shortcuts()
      .filter((s) => s.hotkey !== '')
      .map((s) => ({
        hotkey: s.hotkey as Hotkey,
        callback: () => {
          console.log(`${s.name} triggered:`, s.hotkey)
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
      hotkey: '',
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
        <h1>Keyboard Shortcuts Settings</h1>
        <p>
          Customize your keyboard shortcuts. Click "Edit" to record a new
          shortcut, or press Escape to cancel.
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
            <strong>Recording shortcut...</strong> Press any key combination or
            Escape to cancel. Press Backspace/Delete to clear the shortcut.
          </div>
        </Show>

        <RegistrationsViewer />

        <section class="demo-section">
          <h2>Usage</h2>
          <pre class="code-block">{`import {
  createHotkeys,
  createHotkeyRecorder,
  createHotkeyRegistrations,
} from '@tanstack/solid-hotkeys'

// Register shortcuts dynamically with meta
createHotkeys(() =>
  shortcuts().map((s) => ({
    hotkey: s.hotkey,
    callback: () => handleAction(s.id),
    options: {
      enabled: !recorder.isRecording(),
      meta: { name: s.name, description: s.description },
    },
  })),
)

// Read all registrations reactively
const { hotkeys } = createHotkeyRegistrations()
// hotkeys()[0].options.meta?.name → 'Save'
// hotkeys()[0].triggerCount → 3`}</pre>
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
  const { hotkeys } = createHotkeyRegistrations()

  return (
    <section class="demo-section">
      <h2>Live Registrations</h2>
      <p>
        This table is powered by <code>createHotkeyRegistrations()</code> —
        trigger counts, names, and descriptions update in real-time as you use
        your shortcuts.
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
          <For each={hotkeys()}>
            {(reg) => (
              <tr>
                <td>
                  <kbd>{formatForDisplay(reg.hotkey)}</kbd>
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
          <Show when={hotkeys().length === 0}>
            <tr>
              <td colSpan={5} class="empty-row">
                No hotkeys registered
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
              {heldKeys().length > 0 ? (
                <div class="held-hotkeys">
                  {heldKeys().flatMap((key, index) =>
                    index > 0
                      ? [<span class="plus">+</span>, <kbd>{key}</kbd>]
                      : [<kbd>{key}</kbd>],
                  )}
                </div>
              ) : (
                <span class="recording-text">Press any key combination...</span>
              )}
            </div>
          ) : props.shortcut.hotkey ? (
            <kbd>{formatForDisplay(props.shortcut.hotkey as Hotkey)}</kbd>
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
