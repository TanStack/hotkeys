import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  HotkeysProvider,
  formatForDisplay,
  useHeldKeys,
  useHotkeyRecorder,
  useHotkeyRegistrations,
  useHotkeys,
} from '@tanstack/react-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import './index.css'
import type { Hotkey, HotkeySequence } from '@tanstack/react-hotkeys'

// Created once: a new array on every render remounts the devtools panel
const devtoolsPlugins = [hotkeysDevtoolsPlugin()]

interface Shortcut {
  id: string
  name: string
  description: string
  /** A chord or a sequence; null when unassigned */
  hotkey: Hotkey | null
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
    hotkey: 'Mod+S',
  },
  {
    id: createId(),
    name: 'Open (gg)',
    description: 'Open the file browser',
    hotkey: ['G', 'G'],
  },
  {
    id: createId(),
    name: 'New (dd)',
    description: 'Create a new document',
    hotkey: ['D', 'D'],
  },
  {
    id: createId(),
    name: 'Close',
    description: 'Close the current tab',
    hotkey: 'Mod+Shift+K',
  },
  {
    id: createId(),
    name: 'Undo (yy)',
    description: 'Undo the last action',
    hotkey: ['Y', 'Y'],
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

  // Track which shortcut is being edited
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [draftName, setDraftName] = React.useState('')
  const [draftDescription, setDraftDescription] = React.useState('')

  const recorder = useHotkeyRecorder({
    // Record a chord or a sequence. Enter commits.
    maxSteps: Infinity,
    onRecord: (hotkey: Hotkey) => {
      if (editingId) {
        setShortcuts((prev) =>
          prev.map((s) =>
            s.id === editingId
              ? {
                  ...s,
                  hotkey,
                  name: draftName,
                  description: draftDescription,
                }
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
          if (shortcut && shortcut.hotkey === null) {
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
                  hotkey: null,
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

  // Register every assigned shortcut, chords and sequences alike, with meta
  useHotkeys(
    shortcuts.flatMap((s) =>
      s.hotkey === null
        ? []
        : [
            {
              hotkey: s.hotkey,
              callback: () => {
                console.log(`${s.name} triggered:`, s.hotkey)
              },
              options: {
                meta: { name: s.name, description: s.description },
              },
            },
          ],
    ),
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
      hotkey: null,
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
        <h1>Recording Sequences</h1>
        <p>
          <code>useHotkeyRecorder</code> with <code>maxSteps: Infinity</code>{' '}
          records sequences. Click Edit, press each chord in order, then press
          Enter to save. One chord saves as a regular hotkey. Escape cancels;
          Backspace removes the last chord or clears when empty.
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
                liveSteps={recorder.steps}
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
            <strong>Recording...</strong> Press each chord, then Enter to
            finish. Escape cancels. Backspace removes the last chord or clears.
            {recorder.steps.length > 0 && (
              <div>
                Steps:{' '}
                {recorder.steps.map((h, i) => (
                  <React.Fragment key={`${h}-${i}`}>
                    {i > 0 && ' '}
                    <kbd>{formatForDisplay(h)}</kbd>
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        )}

        <RegistrationsViewer />

        <section className="demo-section">
          <h2>Usage</h2>
          <pre className="code-block">{`import {
  useHotkeys,
  useHotkeyRecorder,
  useHotkeyRegistrations,
} from '@tanstack/react-hotkeys'

// Record a chord or a sequence
const recorder = useHotkeyRecorder({
  maxSteps: Infinity,
  onRecord: (hotkey) => save(hotkey), // 'Mod+S' or ['G', 'G']
})

// Register chords and sequences together, with meta
useHotkeys(
  shortcuts.map((s) => ({
    hotkey: s.hotkey,
    callback: () => handleAction(s.id),
    options: {
      meta: { name: s.name, description: s.description },
    },
  })),
)

// Read all registrations reactively
const registrations = useHotkeyRegistrations()
// registrations[0].options.meta?.name → 'Save'
// registrations[0].triggerCount → 3`}</pre>
        </section>
      </main>
      <TanStackDevtools plugins={devtoolsPlugins} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Live registrations viewer using useHotkeyRegistrations
// ---------------------------------------------------------------------------

function RegistrationsViewer() {
  const registrations = useHotkeyRegistrations()

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
          {registrations.map((reg) => (
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
          {registrations.length === 0 && (
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
  liveSteps: HotkeySequence
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
  liveSteps,
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
                onChange={(e) => onDraftNameChange(e.target.value)}
                placeholder="Shortcut name"
              />
              <input
                type="text"
                className="edit-input edit-description"
                value={draftDescription}
                onChange={(e) => onDraftDescriptionChange(e.target.value)}
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
              {liveSteps.length > 0 ? (
                <span className="held-hotkeys">
                  {formatForDisplay(liveSteps)}
                </span>
              ) : heldKeys.length > 0 ? (
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
                  Press chords, then Enter...
                </span>
              )}
            </div>
          ) : shortcut.hotkey !== null ? (
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HotkeysProvider>
    <App />
  </HotkeysProvider>,
)
