import { createRoot, delegateEvents, useState } from 'octane'

delegateEvents(['click', 'input', 'keydown'])

import {
  HotkeysProvider,
  formatForDisplay,
  useHeldKeys,
  useHotkeyRecorder,
  useHotkeyRegistrations,
  useHotkeys,
} from '@tanstack/octane-hotkeys'

import './index.css'

import type { Hotkey } from '@tanstack/octane-hotkeys'

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
    hotkey: 'Mod+[KeyK]',
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

function App() @{
  const [shortcuts, setShortcuts] = useState<Array<Shortcut>>(
    () => INITIAL_SHORTCUTS,
  )
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')
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
                  hotkey: '',
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
  useHotkeys(
    shortcuts
      .filter((s) => s.hotkey !== '')
      .map((s) => ({
        hotkey: s.hotkey as Hotkey,
        callback: () => {
          console.log(`${s.name} triggered:`, s.hotkey)
        },
        options: {
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
              @for (const shortcut of shortcuts; key shortcut.id) {
  <ShortcutListItem shortcut={shortcut} isEditing={editingId === shortcut.id} draftName={
                    editingId === shortcut.id ? draftName : shortcut.name
                  } draftDescription={
                    editingId === shortcut.id
                      ? draftDescription
                      : shortcut.description
                  } onDraftNameChange={setDraftName} onDraftDescriptionChange={setDraftDescription} onEdit={() => handleEdit(shortcut.id)} onSave={handleSaveEditing} onCancel={handleCancel} onDelete={() => handleDelete(shortcut.id)} /> }
            </div>
            <button type="button" className="create-button" onClick={handleCreateNew} disabled={isRecording}>
              + Create New Shortcut
            </button>
          </section>

          @if (recorder.isRecording) { <div className="info-box recording-notice">
              <strong>Recording shortcut...</strong> The physical key position
              will be saved. Press any key combination or Escape to cancel. Press
              Backspace/Delete to clear the shortcut.
            </div> }

          <RegistrationsViewer />

          <section className="demo-section">
            <h2>Usage</h2>
            <pre className="code-block">{`import {
    useHotkeys,
    useHotkeyRecorder,
    useHotkeyRegistrations,
  } from '@tanstack/octane-hotkeys'

  // Register shortcuts dynamically with meta
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
                  <span className={
                      reg.options.enabled !== false ? 'status-on' : 'status-off'
                    }>
                    {reg.options.enabled !== false ? 'yes' : 'no'}
                  </span>
                </td>
                <td className="trigger-count">{reg.triggerCount}</td>
              </tr> }
            @if (hotkeys.length === 0) { <tr>
                <td colSpan={5} className="empty-row">
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
                @if (heldKeys.length > 0) { <div className="held-hotkeys">
                    @for (const [index, key] of Array.from((heldKeys).entries()); key key) {
  <>
                        @if (index > 0) { <span className="plus">+</span> }
                        <kbd>{key}</kbd>
                      </> }
                  </div> } @else { <span className="recording-text">
                    Press any key combination...
                  </span> }
              </div> } @else { @if (shortcut.hotkey) { <kbd>{formatForDisplay(shortcut.hotkey)}</kbd> } @else { <span className="no-shortcut">No shortcut</span> } }
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
