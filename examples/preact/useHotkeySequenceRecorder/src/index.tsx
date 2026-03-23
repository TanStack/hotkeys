import React from 'preact/compat'
import { render } from 'preact'
import {
  HotkeysProvider,
  formatForDisplay,
  useHeldKeys,
  useHotkeySequence,
  useHotkeySequenceRecorder,
} from '@tanstack/preact-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/preact-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/preact-devtools'
import './index.css'
import type { HotkeySequence } from '@tanstack/preact-hotkeys'

interface ShortcutActions {
  [key: string]: {
    name: string
    defaultSequence: HotkeySequence
  }
}

const DEFAULT_SHORTCUT_ACTIONS: ShortcutActions = {
  save: {
    name: 'Save',
    defaultSequence: ['Mod+S'],
  },
  open: {
    name: 'Open (gg)',
    defaultSequence: ['G', 'G'],
  },
  new: {
    name: 'New (dd)',
    defaultSequence: ['D', 'D'],
  },
  close: {
    name: 'Close',
    defaultSequence: ['Mod+Shift+K'],
  },
  undo: {
    name: 'Undo (yy)',
    defaultSequence: ['Y', 'Y'],
  },
  redo: {
    name: 'Redo',
    defaultSequence: ['Mod+Shift+G'],
  },
}

function resolveSequence(
  actionId: string,
  shortcuts: Record<string, HotkeySequence | null>,
): HotkeySequence {
  const s = shortcuts[actionId]
  if (s !== null) {
    return s
  }
  return DEFAULT_SHORTCUT_ACTIONS[actionId].defaultSequence
}

const devtoolsPlugins = [hotkeysDevtoolsPlugin()]

function App() {
  const [shortcuts, setShortcuts] = React.useState<
    Record<string, HotkeySequence | null>
  >(() => {
    const initial: Record<string, HotkeySequence | null> = {}
    for (const id of Object.keys(DEFAULT_SHORTCUT_ACTIONS)) {
      initial[id] = null
    }
    return initial
  })

  const [saveCount, setSaveCount] = React.useState(0)
  const [openCount, setOpenCount] = React.useState(0)
  const [newCount, setNewCount] = React.useState(0)
  const [closeCount, setCloseCount] = React.useState(0)
  const [undoCount, setUndoCount] = React.useState(0)
  const [redoCount, setRedoCount] = React.useState(0)

  const [recordingActionId, setRecordingActionId] = React.useState<
    string | null
  >(null)

  const recorder = useHotkeySequenceRecorder({
    onRecord: (sequence: HotkeySequence) => {
      if (recordingActionId) {
        setShortcuts((prev) => ({
          ...prev,
          [recordingActionId]: sequence,
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
          [recordingActionId]: [],
        }))
        setRecordingActionId(null)
      }
    },
  })

  const isRecording = recorder.isRecording

  const saveSeq = resolveSequence('save', shortcuts)
  const openSeq = resolveSequence('open', shortcuts)
  const newSeq = resolveSequence('new', shortcuts)
  const closeSeq = resolveSequence('close', shortcuts)
  const undoSeq = resolveSequence('undo', shortcuts)
  const redoSeq = resolveSequence('redo', shortcuts)

  useHotkeySequence(
    saveSeq,
    () => {
      console.log('Save triggered:', saveSeq)
      setSaveCount((c) => c + 1)
    },
    {
      enabled: !isRecording && saveSeq.length > 0,
    },
  )

  useHotkeySequence(
    openSeq,
    () => {
      console.log('Open triggered:', openSeq)
      setOpenCount((c) => c + 1)
    },
    {
      enabled: !isRecording && openSeq.length > 0,
    },
  )

  useHotkeySequence(
    newSeq,
    () => {
      console.log('New triggered:', newSeq)
      setNewCount((c) => c + 1)
    },
    {
      enabled: !isRecording && newSeq.length > 0,
    },
  )

  useHotkeySequence(
    closeSeq,
    () => {
      console.log('Close triggered:', closeSeq)
      setCloseCount((c) => c + 1)
    },
    {
      enabled: !isRecording && closeSeq.length > 0,
    },
  )

  useHotkeySequence(
    undoSeq,
    () => {
      console.log('Undo triggered:', undoSeq)
      setUndoCount((c) => c + 1)
    },
    {
      enabled: !isRecording && undoSeq.length > 0,
    },
  )

  useHotkeySequence(
    redoSeq,
    () => {
      console.log('Redo triggered:', redoSeq)
      setRedoCount((c) => c + 1)
    },
    {
      enabled: !isRecording && redoSeq.length > 0,
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
        <h1>Sequence shortcut settings</h1>
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
            {Object.entries(DEFAULT_SHORTCUT_ACTIONS).map(
              ([actionId, action]) => (
                <ShortcutListItem
                  key={actionId}
                  actionName={action.name}
                  sequence={resolveSequence(actionId, shortcuts)}
                  disabled={resolveSequence(actionId, shortcuts).length === 0}
                  isRecording={
                    recorder.isRecording && recordingActionId === actionId
                  }
                  liveSteps={recorder.steps}
                  onEdit={() => handleEdit(actionId)}
                  onCancel={handleCancel}
                />
              ),
            )}
          </div>
        </section>

        <section className="demo-section">
          <h2>Demo actions</h2>
          <p>Try your sequences within the default timeout window.</p>
          <div className="demo-stats">
            <div className="stat-item">
              <div className="stat-label">Save</div>
              <div className="stat-value">{saveCount}</div>
              <kbd>{formatSequenceLabel('save', shortcuts)}</kbd>
            </div>
            <div className="stat-item">
              <div className="stat-label">Open</div>
              <div className="stat-value">{openCount}</div>
              <kbd>{formatSequenceLabel('open', shortcuts)}</kbd>
            </div>
            <div className="stat-item">
              <div className="stat-label">New</div>
              <div className="stat-value">{newCount}</div>
              <kbd>{formatSequenceLabel('new', shortcuts)}</kbd>
            </div>
            <div className="stat-item">
              <div className="stat-label">Close</div>
              <div className="stat-value">{closeCount}</div>
              <kbd>{formatSequenceLabel('close', shortcuts)}</kbd>
            </div>
            <div className="stat-item">
              <div className="stat-label">Undo</div>
              <div className="stat-value">{undoCount}</div>
              <kbd>{formatSequenceLabel('undo', shortcuts)}</kbd>
            </div>
            <div className="stat-item">
              <div className="stat-label">Redo</div>
              <div className="stat-value">{redoCount}</div>
              <kbd>{formatSequenceLabel('redo', shortcuts)}</kbd>
            </div>
          </div>
        </section>

        {recorder.isRecording && (
          <div className="info-box recording-notice">
            <strong>Recording sequence…</strong> Press each chord, then Enter to
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

        <section className="demo-section">
          <h2>Usage</h2>
          <pre className="code-block">{`import { useHotkeySequence } from '@tanstack/preact-hotkeys'

useHotkeySequence(['G', 'G'], () => goTop(), { enabled: !isRecording })`}</pre>
        </section>
      </main>
    </div>
  )
}

function formatSequenceLabel(
  actionId: string,
  shortcuts: Record<string, HotkeySequence | null>,
): string {
  const seq = resolveSequence(actionId, shortcuts)
  if (seq.length === 0) {
    return '—'
  }
  return seq.map((h) => formatForDisplay(h)).join(' ')
}

interface ShortcutListItemProps {
  actionName: string
  sequence: HotkeySequence
  disabled: boolean
  isRecording: boolean
  liveSteps: HotkeySequence
  onEdit: () => void
  onCancel: () => void
}

function ShortcutListItem({
  actionName,
  sequence,
  disabled,
  isRecording,
  liveSteps,
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
                  Press chords, then Enter…
                </span>
              )}
            </div>
          ) : disabled ? (
            <span className="no-shortcut">No shortcut</span>
          ) : (
            <kbd>{sequence.map((h) => formatForDisplay(h)).join(' ')}</kbd>
          )}
        </div>
      </div>
      <div className="shortcut-actions">
        {isRecording ? (
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
        ) : (
          <button type="button" onClick={onEdit} className="edit-button">
            Edit
          </button>
        )}
      </div>
    </div>
  )
}

render(
  <HotkeysProvider>
    <App />
    <TanStackDevtools plugins={devtoolsPlugins} />
  </HotkeysProvider>,
  document.getElementById('root')!,
)
