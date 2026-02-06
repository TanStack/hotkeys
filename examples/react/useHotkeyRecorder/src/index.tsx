import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  formatForDisplay,
  useHotkey,
  useHeldKeys,
  useHotkeyRecorder,
  type Hotkey,
} from '@tanstack/react-keys'
import './index.css'

interface ShortcutActions {
  [key: string]: {
    name: string
    defaultHotkey: Hotkey
  }
}

const DEFAULT_SHORTCUT_ACTIONS: ShortcutActions = {
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
}

function App() {
  // State for shortcuts
  const [shortcuts, setShortcuts] = React.useState<Record<string, Hotkey | ''>>(
    () => {
      const defaults: Record<string, Hotkey> = {}
      for (const [id, action] of Object.entries(DEFAULT_SHORTCUT_ACTIONS)) {
        defaults[id] = action.defaultHotkey
      }
      return defaults
    },
  )

  // Simple counters for each action
  const [saveCount, setSaveCount] = React.useState(0)
  const [openCount, setOpenCount] = React.useState(0)
  const [newCount, setNewCount] = React.useState(0)
  const [closeCount, setCloseCount] = React.useState(0)
  const [undoCount, setUndoCount] = React.useState(0)
  const [redoCount, setRedoCount] = React.useState(0)

  // Track which action is being recorded
  const [recordingActionId, setRecordingActionId] = React.useState<
    string | null
  >(null)

  // Use the library's useHotkeyRecorder hook
  const recorder = useHotkeyRecorder({
    onRecord: (hotkey: Hotkey) => {
      if (recordingActionId) {
        setShortcuts((prev) => ({
          ...prev,
          [recordingActionId]: hotkey || ('' as Hotkey | ''),
        }))
        setRecordingActionId(null)
      }
    },
    onCancel: () => {
      setRecordingActionId(null)
    },
    onClear: () => {
      if (recordingActionId) {
        setShortcuts((prev) => ({
          ...prev,
          [recordingActionId]: '' as Hotkey | '',
        }))
        setRecordingActionId(null)
      }
    },
  })

  // Register shortcuts using useHotkey
  const isRecording = recorder.isRecording

  // Get actual hotkey values (use defaults if empty)
  const saveHotkey: Hotkey =
    shortcuts.save || DEFAULT_SHORTCUT_ACTIONS.save.defaultHotkey
  const openHotkey: Hotkey =
    shortcuts.open || DEFAULT_SHORTCUT_ACTIONS.open.defaultHotkey
  const newHotkey: Hotkey =
    shortcuts.new || DEFAULT_SHORTCUT_ACTIONS.new.defaultHotkey
  const closeHotkey: Hotkey =
    shortcuts.close || DEFAULT_SHORTCUT_ACTIONS.close.defaultHotkey
  const undoHotkey: Hotkey =
    shortcuts.undo || DEFAULT_SHORTCUT_ACTIONS.undo.defaultHotkey
  const redoHotkey: Hotkey =
    shortcuts.redo || DEFAULT_SHORTCUT_ACTIONS.redo.defaultHotkey

  // Register each shortcut - only enable if shortcut is actually set (not empty)
  useHotkey(
    saveHotkey,
    () => {
      console.log('Save triggered:', saveHotkey)
      setSaveCount((c) => c + 1)
    },
    {
      enabled: !isRecording && shortcuts.save !== '',
      preventDefault: true,
    },
  )

  useHotkey(
    openHotkey,
    () => {
      console.log('Open triggered:', openHotkey)
      setOpenCount((c) => c + 1)
    },
    {
      enabled: !isRecording && shortcuts.open !== '',
      preventDefault: true,
    },
  )

  useHotkey(
    newHotkey,
    () => {
      console.log('New triggered:', newHotkey)
      setNewCount((c) => c + 1)
    },
    {
      enabled: !isRecording && shortcuts.new !== '',
      preventDefault: true,
    },
  )

  useHotkey(
    closeHotkey,
    () => {
      console.log('Close triggered:', closeHotkey)
      setCloseCount((c) => c + 1)
    },
    {
      enabled: !isRecording && shortcuts.close !== '',
      preventDefault: true,
    },
  )

  useHotkey(
    undoHotkey,
    () => {
      console.log('Undo triggered:', undoHotkey)
      setUndoCount((c) => c + 1)
    },
    {
      enabled: !isRecording && shortcuts.undo !== '',
      preventDefault: true,
    },
  )

  useHotkey(
    redoHotkey,
    () => {
      console.log('Redo triggered:', redoHotkey)
      setRedoCount((c) => c + 1)
    },
    {
      enabled: !isRecording && shortcuts.redo !== '',
      preventDefault: true,
    },
  )

  const handleEdit = (actionId: string) => {
    setRecordingActionId(actionId)
    recorder.startRecording()
  }

  const handleCancel = () => {
    recorder.cancelRecording()
    setRecordingActionId(null)
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
            {Object.entries(DEFAULT_SHORTCUT_ACTIONS).map(
              ([actionId, action]) => (
                <ShortcutListItem
                  key={actionId}
                  actionName={action.name}
                  hotkey={shortcuts[actionId] || ''}
                  isRecording={
                    recorder.isRecording && recordingActionId === actionId
                  }
                  onEdit={() => handleEdit(actionId)}
                  onCancel={handleCancel}
                />
              ),
            )}
          </div>
        </section>

        <section className="demo-section">
          <h2>Demo Actions</h2>
          <p>Try your shortcuts! Actions will trigger when you press them.</p>
          <div className="demo-stats">
            <div className="stat-item">
              <div className="stat-label">Save</div>
              <div className="stat-value">{saveCount}</div>
              <kbd>{formatForDisplay(shortcuts.save || 'Mod+K')}</kbd>
            </div>
            <div className="stat-item">
              <div className="stat-label">Open</div>
              <div className="stat-value">{openCount}</div>
              <kbd>{formatForDisplay(shortcuts.open || 'Mod+E')}</kbd>
            </div>
            <div className="stat-item">
              <div className="stat-label">New</div>
              <div className="stat-value">{newCount}</div>
              <kbd>{formatForDisplay(shortcuts.new || 'Mod+G')}</kbd>
            </div>
            <div className="stat-item">
              <div className="stat-label">Close</div>
              <div className="stat-value">{closeCount}</div>
              <kbd>{formatForDisplay(shortcuts.close || 'Mod+Shift+K')}</kbd>
            </div>
            <div className="stat-item">
              <div className="stat-label">Undo</div>
              <div className="stat-value">{undoCount}</div>
              <kbd>{formatForDisplay(shortcuts.undo || 'Mod+Shift+E')}</kbd>
            </div>
            <div className="stat-item">
              <div className="stat-label">Redo</div>
              <div className="stat-value">{redoCount}</div>
              <kbd>{formatForDisplay(shortcuts.redo || 'Mod+Shift+G')}</kbd>
            </div>
          </div>
        </section>

        {recorder.isRecording && (
          <div className="info-box recording-notice">
            <strong>Recording shortcut...</strong> Press any key combination or
            Escape to cancel. Press Backspace/Delete to clear the shortcut.
          </div>
        )}

        <section className="demo-section">
          <h2>Usage</h2>
          <pre className="code-block">{`import { useHotkey, formatForDisplay } from '@tanstack/react-keys'

function App() {
  const [shortcuts, setShortcuts] = useState({
    save: 'Mod+K',
    open: 'Mod+E',
  })

  // Register shortcuts dynamically
  useHotkey(
    shortcuts.save,
    () => handleSave(),
    { enabled: !isRecording }
  )

  return (
    <div>
      <kbd>{formatForDisplay(shortcuts.save)}</kbd>
    </div>
  )
}`}</pre>
        </section>
      </main>
    </div>
  )
}

interface ShortcutListItemProps {
  actionName: string
  hotkey: string
  isRecording: boolean
  onEdit: () => void
  onCancel: () => void
}

function ShortcutListItem({
  actionName,
  hotkey,
  isRecording,
  onEdit,
  onCancel,
}: ShortcutListItemProps) {
  const heldKeys = useHeldKeys()

  return (
    <div className={`shortcut-item ${isRecording ? 'recording' : ''}`}>
      <div className="shortcut-item-content">
        <div className="shortcut-action">{actionName}</div>
        <div className="shortcut-hotkey">
          {isRecording ? (
            <div className="recording-indicator">
              {heldKeys.length > 0 ? (
                <div className="held-keys">
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
          ) : hotkey ? (
            <kbd>{formatForDisplay(hotkey as Hotkey)}</kbd>
          ) : (
            <span className="no-shortcut">No shortcut</span>
          )}
        </div>
      </div>
      <div className="shortcut-actions">
        {isRecording ? (
          <button onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        ) : (
          <button onClick={onEdit} className="edit-button">
            Edit
          </button>
        )}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
