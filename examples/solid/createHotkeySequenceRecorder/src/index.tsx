/* @refresh reload */
import { render } from 'solid-js/web'
import { createSignal, For, Show } from 'solid-js'
import {
  formatForDisplay,
  createHeldKeys,
  createHotkeySequence,
  createHotkeySequenceRecorder,
  HotkeysProvider,
} from '@tanstack/solid-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/solid-devtools'
import type { HotkeySequence } from '@tanstack/solid-hotkeys'
import './index.css'

const DEFAULT_SHORTCUT_ACTIONS: Record<
  string,
  { name: string; defaultSequence: HotkeySequence }
> = {
  save: { name: 'Save', defaultSequence: ['Mod+S'] },
  open: { name: 'Open (gg)', defaultSequence: ['G', 'G'] },
  new: { name: 'New (dd)', defaultSequence: ['D', 'D'] },
  close: { name: 'Close', defaultSequence: ['Mod+Shift+K'] },
  undo: { name: 'Undo (yy)', defaultSequence: ['Y', 'Y'] },
  redo: { name: 'Redo', defaultSequence: ['Mod+Shift+G'] },
}

const ACTION_ENTRIES = Object.entries(DEFAULT_SHORTCUT_ACTIONS)

function formatSeq(seq: HotkeySequence): string {
  return seq.map((h) => formatForDisplay(h)).join(' ')
}

function ShortcutListItem(props: {
  actionName: string
  sequence: HotkeySequence
  disabled: boolean
  isRecording: boolean
  liveSteps: HotkeySequence
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
              {props.liveSteps.length > 0 ? (
                <span class="held-hotkeys">{formatSeq(props.liveSteps)}</span>
              ) : heldKeys().length > 0 ? (
                <div class="held-hotkeys">
                  {heldKeys().flatMap((key, index) =>
                    index > 0
                      ? [<span class="plus">+</span>, <kbd>{key}</kbd>]
                      : [<kbd>{key}</kbd>],
                  )}
                </div>
              ) : (
                <span class="recording-text">Press chords, then Enter…</span>
              )}
            </div>
          ) : props.disabled ? (
            <span class="no-shortcut">No shortcut</span>
          ) : (
            <kbd>{formatSeq(props.sequence)}</kbd>
          )}
        </div>
      </div>
      <div class="shortcut-actions">
        {props.isRecording ? (
          <button type="button" onClick={props.onCancel} class="cancel-button">
            Cancel
          </button>
        ) : (
          <button type="button" onClick={props.onEdit} class="edit-button">
            Edit
          </button>
        )}
      </div>
    </div>
  )
}

function App() {
  const [shortcuts, setShortcuts] = createSignal<
    Record<string, HotkeySequence | null>
  >(
    Object.fromEntries(
      Object.keys(DEFAULT_SHORTCUT_ACTIONS).map((id) => [id, null]),
    ) as Record<string, HotkeySequence | null>,
  )

  const resolveSeq = (actionId: string): HotkeySequence => {
    const s = shortcuts()[actionId]
    if (s != null) {
      return s
    }
    return DEFAULT_SHORTCUT_ACTIONS[actionId].defaultSequence
  }

  const [saveCount, setSaveCount] = createSignal(0)
  const [openCount, setOpenCount] = createSignal(0)
  const [newCount, setNewCount] = createSignal(0)
  const [closeCount, setCloseCount] = createSignal(0)
  const [undoCount, setUndoCount] = createSignal(0)
  const [redoCount, setRedoCount] = createSignal(0)
  const [recordingActionId, setRecordingActionId] = createSignal<string | null>(
    null,
  )

  const recorder = createHotkeySequenceRecorder({
    onRecord: (sequence: HotkeySequence) => {
      const id = recordingActionId()
      if (id) {
        setShortcuts((prev) => ({
          ...prev,
          [id]: sequence,
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
          [id]: [],
        }))
        setRecordingActionId(null)
      }
    },
  })

  createHotkeySequence(
    () => resolveSeq('save'),
    () => setSaveCount((c) => c + 1),
    () => ({
      enabled: !recorder.isRecording() && resolveSeq('save').length > 0,
    }),
  )
  createHotkeySequence(
    () => resolveSeq('open'),
    () => setOpenCount((c) => c + 1),
    () => ({
      enabled: !recorder.isRecording() && resolveSeq('open').length > 0,
    }),
  )
  createHotkeySequence(
    () => resolveSeq('new'),
    () => setNewCount((c) => c + 1),
    () => ({
      enabled: !recorder.isRecording() && resolveSeq('new').length > 0,
    }),
  )
  createHotkeySequence(
    () => resolveSeq('close'),
    () => setCloseCount((c) => c + 1),
    () => ({
      enabled: !recorder.isRecording() && resolveSeq('close').length > 0,
    }),
  )
  createHotkeySequence(
    () => resolveSeq('undo'),
    () => setUndoCount((c) => c + 1),
    () => ({
      enabled: !recorder.isRecording() && resolveSeq('undo').length > 0,
    }),
  )
  createHotkeySequence(
    () => resolveSeq('redo'),
    () => setRedoCount((c) => c + 1),
    () => ({
      enabled: !recorder.isRecording() && resolveSeq('redo').length > 0,
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

  const statLabel = (id: string) => {
    const seq = resolveSeq(id)
    if (seq.length === 0) {
      return '—'
    }
    return formatSeq(seq)
  }

  return (
    <div class="app">
      <header>
        <h1>Sequence shortcut settings</h1>
        <p>
          Customize Vim-style sequences. Click Edit, press each chord in order,
          then Enter to save. Escape cancels; Backspace removes the last chord
          or clears when empty.
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
                  sequence={resolveSeq(actionId)}
                  disabled={resolveSeq(actionId).length === 0}
                  liveSteps={recorder.steps()}
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
          <h2>Demo actions</h2>
          <p>Try your sequences within the default timeout window.</p>
          <div class="demo-stats">
            <div class="stat-item">
              <div class="stat-label">Save</div>
              <div class="stat-value">{saveCount()}</div>
              <kbd>{statLabel('save')}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Open</div>
              <div class="stat-value">{openCount()}</div>
              <kbd>{statLabel('open')}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">New</div>
              <div class="stat-value">{newCount()}</div>
              <kbd>{statLabel('new')}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Close</div>
              <div class="stat-value">{closeCount()}</div>
              <kbd>{statLabel('close')}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Undo</div>
              <div class="stat-value">{undoCount()}</div>
              <kbd>{statLabel('undo')}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Redo</div>
              <div class="stat-value">{redoCount()}</div>
              <kbd>{statLabel('redo')}</kbd>
            </div>
          </div>
        </section>

        <Show when={recorder.isRecording()}>
          <div class="info-box recording-notice">
            <strong>Recording sequence…</strong> Press each chord, then Enter to
            finish. Escape cancels. Backspace removes the last chord or clears.
            <Show when={recorder.steps().length > 0}>
              <div>Steps: {formatSeq(recorder.steps())}</div>
            </Show>
          </div>
        </Show>

        <section class="demo-section">
          <h2>Usage</h2>
          <pre class="code-block">{`import { createHotkeySequence, createHotkeySequenceRecorder } from '@tanstack/solid-hotkeys'

createHotkeySequence(['G', 'G'], () => goTop(), () => ({
  enabled: !recorder.isRecording(),
}))`}</pre>
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
