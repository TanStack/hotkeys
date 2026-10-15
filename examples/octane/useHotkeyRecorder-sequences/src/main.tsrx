import { createRoot, useState } from 'octane'

import {
  HotkeysProvider,
  formatForDisplay,
  useHeldKeys,
  useHotkeyRegistrations,
  useHotkeyRecorder,
  useHotkeys,
} from '@tanstack/octane-hotkeys'

import './index.css'

import type { Hotkey, HotkeySequence } from '@tanstack/octane-hotkeys'

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

function App() @{
  const [shortcuts, setShortcuts] = useState<Array<Shortcut>>(
    () => INITIAL_SHORTCUTS,
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
  const recorder = useHotkeyRecorder({
    // Record up to four chords; Enter or the fourth chord commits.
    maxSteps: 4,
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
  <div className="app">
        <header>
          <h1>Recording Sequences</h1>
          <p>
            <code>useHotkeyRecorder</code> with <code>maxSteps</code> records up
            to that many chords. Click Edit, press each chord in order, then
            press Enter (or reach four chords) to save. One chord saves as a
            regular hotkey. Escape cancels; Backspace removes the last chord or
            clears when empty.
          </p>
        </header>

        <main>
          <section className="demo-section">
            <h2>Shortcuts</h2>
            <div className="shortcuts-list">
              @for (const shortcut of shortcuts; key shortcut.id) {
  <ShortcutListItem shortcut={shortcut} isEditing={editingId === shortcut.id} draftName={
                    editingId === shortcut.id ? draftName : shortcut.name
                  } draftDescription={
                    editingId === shortcut.id
                      ? draftDescription
                      : shortcut.description
                  } onDraftNameChange={setDraftName} onDraftDescriptionChange={setDraftDescription} liveSteps={recorder.steps} onEdit={() => handleEdit(shortcut.id)} onSave={handleSaveEditing} onCancel={handleCancel} onDelete={() => handleDelete(shortcut.id)} /> }
            </div>
            <button type="button" className="create-button" onClick={handleCreateNew} disabled={isRecording}>
              + Create New Shortcut
            </button>
          </section>

          @if (recorder.isRecording) { <div className="info-box recording-notice">
              <strong>Recording...</strong> Press up to four chords, then Enter
              to finish. Escape cancels. Backspace removes the last chord or
              clears.
              @if (recorder.steps.length > 0) { <div>
                  Steps:{' '}
                  <kbd>{formatForDisplay(recorder.steps)}</kbd>
                </div> }
            </div> }

          <RegistrationsViewer />

          <section className="demo-section">
            <h2>Usage</h2>
            <pre className="code-block">{`import {
    useHotkeys,
    useHotkeyRecorder,
    useHotkeyRegistrations,
  } from '@tanstack/octane-hotkeys'

  // Record a chord or a sequence of up to four chords
  const recorder = useHotkeyRecorder({
    maxSteps: 4,
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
  const { hotkeys } = useHotkeyRegistrations()
  // hotkeys[0].options.meta?.name → 'Save'
  // hotkeys[0].triggerCount → 3`}</pre>
          </section>
        </main>

      </div>
}

function RegistrationsViewer() @{
  const { hotkeys } = useHotkeyRegistrations()
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
              <th>Progress</th>
              <th>Enabled</th>
              <th>Triggers</th>
            </tr>
          </thead>
          <tbody>
            @for (const reg of hotkeys; key reg.id) {
  <tr>
                <td>
                  <kbd>{formatForDisplay(reg.hotkey)}</kbd>
                </td>
                <td>{reg.options.meta?.name ?? '—'}</td>
                <td className="description-cell">
                  {reg.options.meta?.description ?? '—'}
                </td>
                <td>
                  {reg.kind === 'sequence'
                    ? `${reg.matchedStepCount}/${reg.hotkey.length}`
                    : '—'}
                </td>
                <td>
                  <span className={
                      reg.options.enabled !== false ? 'status-on' : 'status-off'
                    }>
                    {reg.options.enabled !== false ? 'yes' : 'no'}
                  </span>
                </td>
                <td className="trigger-count">{reg.triggerCount}</td>
              </tr> }
            @if (hotkeys.length === 0) { <tr>
                <td colSpan={6} className="empty-row">
                  No hotkeys registered
                </td>
              </tr> }
          </tbody>
        </table>
      </section>
}

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
}: ShortcutListItemProps) @{
  const heldKeys = useHeldKeys()
  <div className={`shortcut-item ${isEditing ? 'recording' : ''}`}>
        <div className="shortcut-item-content">
          <div className="shortcut-action">
            @if (isEditing) { <div className="editing-fields">
                <input type="text" className="edit-input edit-name" value={draftName} onInput={(e) => onDraftNameChange(e.currentTarget.value)} placeholder="Shortcut name" />
                <input type="text" className="edit-input edit-description" value={draftDescription} onInput={(e) => onDraftDescriptionChange(e.currentTarget.value)} placeholder="Description (optional)" />
              </div> } @else { <>
                @if (shortcut.name) { <span>{shortcut.name}</span> } @else { <span className="unnamed">Unnamed</span> }
                @if (shortcut.description) { <div className="shortcut-description">
                    {shortcut.description}
                  </div> }
              </> }
          </div>
          <div className="shortcut-hotkey">
            @if (isEditing) { <div className="recording-indicator">
                @if (liveSteps.length > 0) { <span className="held-hotkeys">
                    {formatForDisplay(liveSteps)}
                  </span> } @else { @if (heldKeys.length > 0) { <div className="held-hotkeys">
                    @for (const [index, key] of Array.from(heldKeys.entries()); key key) {
  <>
                        @if (index > 0) { <span className="plus">+</span> }
                        <kbd>{key}</kbd>
                      </> }
                  </div> } @else { <span className="recording-text">
                    Press chords, then Enter...
                  </span> } }
              </div> } @else { @if (shortcut.hotkey !== null) { <kbd>
                {formatForDisplay(shortcut.hotkey)}
              </kbd> } @else { <span className="no-shortcut">No shortcut</span> } }
          </div>
        </div>
        <div className="shortcut-actions">
          @if (isEditing) { <>
              <button type="button" onClick={onSave} className="save-button">
                Save
              </button>
              <button type="button" onClick={onCancel} className="cancel-button">
                Cancel
              </button>
            </> } @else { <>
              <button type="button" onClick={onEdit} className="edit-button">
                Edit
              </button>
              <button type="button" onClick={onDelete} className="delete-button">
                Delete
              </button>
            </> }
        </div>
      </div>
}

function Root() @{
<HotkeysProvider><App /></HotkeysProvider>
}

const root = createRoot(document.getElementById('root')!)
root.render(Root)
import.meta.hot?.dispose(() => root.unmount())
