import React from 'preact/compat'
import { render } from 'preact'
import {
  HotkeysProvider,
  formatForDisplay,
  useHeldKeys,
  useHotkeyRegistrations,
  useHotkeySequenceRecorder,
  useHotkeySequences,
} from '@tanstack/preact-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/preact-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/preact-devtools'
import './index.css'
import type { HotkeySequence } from '@tanstack/preact-hotkeys'

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
  const [shortcuts, setShortcuts] = React.useState<Array<Shortcut>>(
    () => INITIAL_SHORTCUTS,
  )

  // Track which shortcut is being edited
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [draftName, setDraftName] = React.useState('')
  const [draftDescription, setDraftDescription] = React.useState('')

  const recorder = useHotkeySequenceRecorder({
    onRecord: (sequence: HotkeySequence) => {
      if (editingId) {
        setShortcuts((prev) =>
          prev.map((s) =>
            s.id === editingId
              ? {
                  ...s,
                  sequence,
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
      // If this was a brand-new shortcut with no sequence yet, remove it
      if (editingId) {
        setShortcuts((prev) => {
          const shortcut = prev.find((s) => s.id === editingId)
          if (shortcut && shortcut.sequence.length === 0) {
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
                  sequence: [],
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

  // Register all sequences with meta
  useHotkeySequences(
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
      sequence: [],
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
        <h1>Sequence Shortcut Settings</h1>
        <p>
          Customize Vim-style sequences. Click Edit, press each chord in order,
          then press Enter to save. Escape cancels; Backspace removes the last
          chord or clears when empty.
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
            <strong>Recording sequence...</strong> Press each chord, then Enter
            to finish. Escape cancels. Backspace removes the last chord or
            clears.
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
  useHotkeySequences,
  useHotkeySequenceRecorder,
  useHotkeyRegistrations,
} from '@tanstack/preact-hotkeys'

// Register sequences dynamically with meta
useHotkeySequences(
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
const { sequences } = useHotkeyRegistrations()
// sequences[0].options.meta?.name → 'Save'
// sequences[0].triggerCount → 3`}</pre>
        </section>
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Live registrations viewer using useHotkeyRegistrations
// ---------------------------------------------------------------------------

function RegistrationsViewer() {
  const { sequences } = useHotkeyRegistrations()

  return (
    <section className="demo-section">
      <h2>Live Registrations</h2>
      <p>
        This table is powered by <code>useHotkeyRegistrations()</code> — trigger
        counts, names, and descriptions update in real-time as you use your
        sequences.
      </p>
      <table className="registrations-table">
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
          {sequences.map((reg) => (
            <tr key={reg.id}>
              <td>
                {reg.sequence.map((s, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && ' '}
                    <kbd>{formatForDisplay(s)}</kbd>
                  </React.Fragment>
                ))}
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
          {sequences.length === 0 && (
            <tr>
              <td colSpan={5} className="empty-row">
                No sequences registered
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
              {liveSteps.length > 0 ? (
                <span className="held-hotkeys">
                  {liveSteps.map((h) => formatForDisplay(h)).join(' ')}
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
          ) : shortcut.sequence.length > 0 ? (
            <kbd>
              {shortcut.sequence.map((h) => formatForDisplay(h)).join(' ')}
            </kbd>
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
