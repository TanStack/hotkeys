/* @refresh reload */
import { render } from 'solid-js/web'
import { createSignal, Show, For } from 'solid-js'
import {
  formatForDisplay,
  createHotkey,
  createHeldKeys,
  createHotkeyRecorder,
  HotkeysProvider,
} from '@tanstack/solid-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/solid-devtools'
import type { Hotkey } from '@tanstack/solid-hotkeys'
import './index.css'

const DEFAULT_SHORTCUT_ACTIONS: Record<
  string,
  { name: string; defaultHotkey: Hotkey }
> = {
  save: { name: 'Save', defaultHotkey: 'Mod+K' },
  open: { name: 'Open', defaultHotkey: 'Mod+E' },
  new: { name: 'New', defaultHotkey: 'Mod+G' },
  close: { name: 'Close', defaultHotkey: 'Mod+Shift+K' },
  undo: { name: 'Undo', defaultHotkey: 'Mod+Shift+E' },
  redo: { name: 'Redo', defaultHotkey: 'Mod+Shift+G' },
}

const ACTION_ENTRIES = Object.entries(DEFAULT_SHORTCUT_ACTIONS)

function ShortcutListItem(props: {
  actionName: string
  hotkey: string
  isRecording: boolean
  onEdit: () => void
  onCancel: () => void
}) {
  const heldKeys = createHeldKeys()

  return (
    <div class={`shortcut-item ${props.isRecording ? 'recording' : ''}`}>
      <div class="shortcut-item-content">
        <div class="shortcut-action">{props.actionName}</div>
        <div class="shortcut-hotkey">
          {props.isRecording ? (
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
          ) : props.hotkey ? (
            <kbd>{formatForDisplay(props.hotkey as Hotkey)}</kbd>
          ) : (
            <span class="no-shortcut">No shortcut</span>
          )}
        </div>
      </div>
      <div class="shortcut-actions">
        {props.isRecording ? (
          <button onClick={props.onCancel} class="cancel-button">
            Cancel
          </button>
        ) : (
          <button onClick={props.onEdit} class="edit-button">
            Edit
          </button>
        )}
      </div>
    </div>
  )
}

function App() {
  const [shortcuts, setShortcuts] = createSignal<Record<string, Hotkey | ''>>(
    () => {
      const defaults: Record<string, Hotkey> = {}
      for (const [id, action] of Object.entries(DEFAULT_SHORTCUT_ACTIONS)) {
        defaults[id] = action.defaultHotkey
      }
      return defaults
    },
  )
  const [saveCount, setSaveCount] = createSignal(0)
  const [openCount, setOpenCount] = createSignal(0)
  const [newCount, setNewCount] = createSignal(0)
  const [closeCount, setCloseCount] = createSignal(0)
  const [undoCount, setUndoCount] = createSignal(0)
  const [redoCount, setRedoCount] = createSignal(0)
  const [recordingActionId, setRecordingActionId] = createSignal<string | null>(
    null,
  )

  const recorder = createHotkeyRecorder({
    onRecord: (hotkey: Hotkey) => {
      const id = recordingActionId()
      if (id) {
        setShortcuts((prev) => ({
          ...prev,
          [id]: hotkey || ('' as Hotkey | ''),
        }))
        setRecordingActionId(null)
      }
    },
    onCancel: () => setRecordingActionId(null),
    onClear: () => {
      const id = recordingActionId()
      if (id) {
        setShortcuts((prev) => ({
          ...prev,
          [id]: '' as Hotkey | '',
        }))
        setRecordingActionId(null)
      }
    },
  })

  const saveHotkey = () =>
    shortcuts().save || DEFAULT_SHORTCUT_ACTIONS.save.defaultHotkey
  const openHotkey = () =>
    shortcuts().open || DEFAULT_SHORTCUT_ACTIONS.open.defaultHotkey
  const newHotkey = () =>
    shortcuts().new || DEFAULT_SHORTCUT_ACTIONS.new.defaultHotkey
  const closeHotkey = () =>
    shortcuts().close || DEFAULT_SHORTCUT_ACTIONS.close.defaultHotkey
  const undoHotkey = () =>
    shortcuts().undo || DEFAULT_SHORTCUT_ACTIONS.undo.defaultHotkey
  const redoHotkey = () =>
    shortcuts().redo || DEFAULT_SHORTCUT_ACTIONS.redo.defaultHotkey

  createHotkey(
    saveHotkey,
    () => {
      setSaveCount((c) => c + 1)
    },
    () => ({
      enabled: !recorder.isRecording() && shortcuts().save !== '',
    }),
  )
  createHotkey(
    openHotkey,
    () => setOpenCount((c) => c + 1),
    () => ({
      enabled: !recorder.isRecording() && shortcuts().open !== '',
    }),
  )
  createHotkey(
    newHotkey,
    () => setNewCount((c) => c + 1),
    () => ({
      enabled: !recorder.isRecording() && shortcuts().new !== '',
    }),
  )
  createHotkey(
    closeHotkey,
    () => setCloseCount((c) => c + 1),
    () => ({
      enabled: !recorder.isRecording() && shortcuts().close !== '',
    }),
  )
  createHotkey(
    undoHotkey,
    () => setUndoCount((c) => c + 1),
    () => ({
      enabled: !recorder.isRecording() && shortcuts().undo !== '',
    }),
  )
  createHotkey(
    redoHotkey,
    () => setRedoCount((c) => c + 1),
    () => ({
      enabled: !recorder.isRecording() && shortcuts().redo !== '',
    }),
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
            <For each={ACTION_ENTRIES}>
              {([actionId, action]) => (
                <ShortcutListItem
                  actionName={action.name}
                  hotkey={shortcuts()[actionId] || ''}
                  isRecording={
                    recorder.isRecording() && recordingActionId() === actionId
                  }
                  onEdit={() => handleEdit(actionId)}
                  onCancel={handleCancel}
                />
              )}
            </For>
          </div>
        </section>

        <section class="demo-section">
          <h2>Demo Actions</h2>
          <p>Try your shortcuts! Actions will trigger when you press them.</p>
          <div class="demo-stats">
            <div class="stat-item">
              <div class="stat-label">Save</div>
              <div class="stat-value">{saveCount()}</div>
              <kbd>{formatForDisplay(shortcuts().save || 'Mod+K')}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Open</div>
              <div class="stat-value">{openCount()}</div>
              <kbd>{formatForDisplay(shortcuts().open || 'Mod+E')}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">New</div>
              <div class="stat-value">{newCount()}</div>
              <kbd>{formatForDisplay(shortcuts().new || 'Mod+G')}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Close</div>
              <div class="stat-value">{closeCount()}</div>
              <kbd>{formatForDisplay(shortcuts().close || 'Mod+Shift+K')}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Undo</div>
              <div class="stat-value">{undoCount()}</div>
              <kbd>{formatForDisplay(shortcuts().undo || 'Mod+Shift+E')}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Redo</div>
              <div class="stat-value">{redoCount()}</div>
              <kbd>{formatForDisplay(shortcuts().redo || 'Mod+Shift+G')}</kbd>
            </div>
          </div>
        </section>

        <Show when={recorder.isRecording()}>
          <div class="info-box recording-notice">
            <strong>Recording shortcut...</strong> Press any key combination or
            Escape to cancel. Press Backspace/Delete to clear the shortcut.
          </div>
        </Show>

        <section class="demo-section">
          <h2>Usage</h2>
          <pre class="code-block">{`import { createHotkey, createHotkeyRecorder } from '@tanstack/solid-hotkeys'

function App() {
  const [shortcuts, setShortcuts] = createSignal({
    save: 'Mod+K',
    open: 'Mod+E',
  })

  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => setShortcuts(prev => ({ ...prev, save: hotkey }))
  })

  createHotkey(
    () => shortcuts().save,
    () => handleSave(),
    () => ({ enabled: !recorder.isRecording() })
  )
}`}</pre>
        </section>
      </main>

      <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
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
