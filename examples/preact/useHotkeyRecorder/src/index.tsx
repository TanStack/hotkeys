import React from 'preact/compat'
import { render } from 'preact'
import {
  HotkeysProvider,
  formatForDisplay,
  useHeldKeys,
  useHotkeyRecorder,
  useHotkeyRegistrations,
  useHotkeys,
} from '@tanstack/preact-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/preact-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/preact-devtools'
import './index.css'
import type { Hotkey } from '@tanstack/preact-hotkeys'

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
  const [shortcuts, setShortcuts] = React.useState<Array<Shortcut>>(
    () => INITIAL_SHORTCUTS,
  )

  // Track which shortcut is being edited (recording + name/description editing)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  // Draft name/description while editing
  const [draftName, setDraftName] = React.useState('')
  const [draftDescription, setDraftDescription] = React.useState('')

  const recorder = useHotkeyRecorder({
    onRecord: (hotkey: Hotkey) => {
      if (editingId) {
        setShortcuts((prev) =>
          prev.map((s) =>
            s.id === editingId
              ? { ...s, hotkey, name: draftName, description: draftDescription }
              : s,
          ),
        )
        setEditingId(null)
      }
    },
    onCancel: () => {
      // If this was a brand-new shortcut with no hotkey yet, remove it
      if (editingId) {
        setShortcuts((prev) => {
          const shortcut = prev.find((s) => s.id === editingId)
          if (shortcut && shortcut.hotkey === '') {
            return prev.filter((s) => s.id !== editingId)
          }
          return prev
        })
      }
      setEditingId(null)
    },
    onClear: () => {
      if (editingId) {
        setShortcuts((prev) =>
          prev.map((s) =>
            s.id === editingId
              ? {
                  ...s,
                  hotkey: '' as Hotkey | '',
                  name: draftName,
                  description: draftDescription,
                }
              : s,
          ),
        )
        setEditingId(null)
      }
    },
  })

  const isRecording = recorder.isRecording

  // Register all shortcuts with meta
  useHotkeys(
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

  const handleEdit = (id: string) => {
    const shortcut = shortcuts.find((s) => s.id === id)
    if (!shortcut) return
    setEditingId(id)
    setDraftName(shortcut.name)
    setDraftDescription(shortcut.description)
    recorder.startRecording()
  }

  const handleSaveEditing = () => {
    if (editingId) {
      // Save draft name/description, keep current hotkey, stop recording
      setShortcuts((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? { ...s, name: draftName, description: draftDescription }
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
    <div className="app">
      <header>
        <h1>Keyboard Shortcuts Settings</h1>
        <p>
          Customize your keyboard shortcuts. Click "Edit" to record a new
          shortcut, or press Escape to cancel.
        </p>
      </header>

      <main>
        <section className="demo-section">
          <h2>Shortcuts</h2>
          <div className="shortcuts-list">
            {shortcuts.map((shortcut) => (
              <ShortcutListItem
                key={shortcut.id}
                shortcut={shortcut}
                isEditing={editingId === shortcut.id}
                draftName={
                  editingId === shortcut.id ? draftName : shortcut.name
                }
                draftDescription={
                  editingId === shortcut.id
                    ? draftDescription
                    : shortcut.description
                }
                onDraftNameChange={setDraftName}
                onDraftDescriptionChange={setDraftDescription}
                onEdit={() => handleEdit(shortcut.id)}
                onSave={handleSaveEditing}
                onCancel={handleCancel}
                onDelete={() => handleDelete(shortcut.id)}
              />
            ))}
          </div>
          <button
            type="button"
            className="create-button"
            onClick={handleCreateNew}
            disabled={isRecording}
          >
            + Create New Shortcut
          </button>
        </section>

        {recorder.isRecording && (
          <div className="info-box recording-notice">
            <strong>Recording shortcut...</strong> Press any key combination or
            Escape to cancel. Press Backspace/Delete to clear the shortcut.
          </div>
        )}

        <RegistrationsViewer />

        <section className="demo-section">
          <h2>Usage</h2>
          <pre className="code-block">{`import {
  useHotkeys,
  useHotkeyRecorder,
  useHotkeyRegistrations,
} from '@tanstack/preact-hotkeys'

// Register shortcuts dynamically with meta
useHotkeys(
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
const { hotkeys } = useHotkeyRegistrations()
// hotkeys[0].options.meta?.name → 'Save'
// hotkeys[0].triggerCount → 3`}</pre>
        </section>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Live registrations viewer using useHotkeyRegistrations
// ---------------------------------------------------------------------------

function RegistrationsViewer() {
  const { hotkeys } = useHotkeyRegistrations()

  return (
    <section className="demo-section">
      <h2>Live Registrations</h2>
      <p>
        This table is powered by <code>useHotkeyRegistrations()</code> — trigger
        counts, names, and descriptions update in real-time as you use your
        shortcuts.
      </p>
      <table className="registrations-table">
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
          {hotkeys.map((reg) => (
            <tr key={reg.id}>
              <td>
                <kbd>{formatForDisplay(reg.hotkey)}</kbd>
              </td>
              <td>{reg.options.meta?.name ?? '—'}</td>
              <td className="description-cell">
                {reg.options.meta?.description ?? '—'}
              </td>
              <td>
                <span
                  className={
                    reg.options.enabled !== false ? 'status-on' : 'status-off'
                  }
                >
                  {reg.options.enabled !== false ? 'yes' : 'no'}
                </span>
              </td>
              <td className="trigger-count">{reg.triggerCount}</td>
            </tr>
          ))}
          {hotkeys.length === 0 && (
            <tr>
              <td colSpan={5} className="empty-row">
                No hotkeys registered
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Shortcut list item with inline editing
// ---------------------------------------------------------------------------

interface ShortcutListItemProps {
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

function ShortcutListItem({
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
}: ShortcutListItemProps) {
  const heldKeys = useHeldKeys()

  return (
    <div className={`shortcut-item ${isEditing ? 'recording' : ''}`}>
      <div className="shortcut-item-content">
        <div className="shortcut-action">
          {isEditing ? (
            <div className="editing-fields">
              <input
                type="text"
                className="edit-input edit-name"
                value={draftName}
                onChange={(e) =>
                  onDraftNameChange((e.target as HTMLInputElement).value)
                }
                placeholder="Shortcut name"
              />
              <input
                type="text"
                className="edit-input edit-description"
                value={draftDescription}
                onChange={(e) =>
                  onDraftDescriptionChange((e.target as HTMLInputElement).value)
                }
                placeholder="Description (optional)"
              />
            </div>
          ) : (
            <>
              {shortcut.name || <span className="unnamed">Unnamed</span>}
              {shortcut.description && (
                <div className="shortcut-description">
                  {shortcut.description}
                </div>
              )}
            </>
          )}
        </div>
        <div className="shortcut-hotkey">
          {isEditing ? (
            <div className="recording-indicator">
              {heldKeys.length > 0 ? (
                <div className="held-hotkeys">
                  {heldKeys.map((key, index) => (
                    <React.Fragment key={key}>
                      {index > 0 && <span className="plus">+</span>}
                      <kbd>{key}</kbd>
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <span className="recording-text">
                  Press any key combination...
                </span>
              )}
            </div>
          ) : shortcut.hotkey ? (
            <kbd>{formatForDisplay(shortcut.hotkey)}</kbd>
          ) : (
            <span className="no-shortcut">No shortcut</span>
          )}
        </div>
      </div>
      <div className="shortcut-actions">
        {isEditing ? (
          <>
            <button type="button" onClick={onSave} className="save-button">
              Save
            </button>
            <button type="button" onClick={onCancel} className="cancel-button">
              Cancel
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={onEdit} className="edit-button">
              Edit
            </button>
            <button type="button" onClick={onDelete} className="delete-button">
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// TanStackDevtools as sibling of App to avoid Preact hook errors when hotkeys update state
const devtoolsPlugins = [hotkeysDevtoolsPlugin()]

render(
  <HotkeysProvider>
    <App />
    <TanStackDevtools plugins={devtoolsPlugins} />
  </HotkeysProvider>,
  document.getElementById('root')!,
)
