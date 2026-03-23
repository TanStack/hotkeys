<script lang="ts">
  import {
    createHotkeySequence,
    createHotkeySequenceRecorder,
    formatForDisplay,
  } from '@tanstack/svelte-hotkeys'
  import type { HotkeySequence } from '@tanstack/svelte-hotkeys'
  import ShortcutListItem from './ShortcutListItem.svelte'

  interface ShortcutActions {
    [key: string]: {
      name: string
      defaultSequence: HotkeySequence
    }
  }

  const DEFAULT_SHORTCUT_ACTIONS = {
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
  } as const satisfies ShortcutActions

  let shortcuts = $state<Record<string, HotkeySequence | null>>(
    Object.fromEntries(
      Object.keys(DEFAULT_SHORTCUT_ACTIONS).map((id) => [id, null]),
    ),
  )

  function resolveSeq(actionId: string): HotkeySequence {
    const s = shortcuts[actionId]
    if (s !== null) {
      return s
    }
    return DEFAULT_SHORTCUT_ACTIONS[
      actionId as keyof typeof DEFAULT_SHORTCUT_ACTIONS
    ].defaultSequence
  }

  function formatStat(id: string): string {
    const seq = resolveSeq(id)
    if (seq.length === 0) {
      return '—'
    }
    return seq.map((h) => formatForDisplay(h)).join(' ')
  }

  let saveCount = $state(0)
  let openCount = $state(0)
  let newCount = $state(0)
  let closeCount = $state(0)
  let undoCount = $state(0)
  let redoCount = $state(0)

  let recordingActionId = $state<string | null>(null)

  const recorder = createHotkeySequenceRecorder({
    onRecord: (sequence: HotkeySequence) => {
      if (recordingActionId) {
        shortcuts = {
          ...shortcuts,
          [recordingActionId]: sequence,
        }
        recordingActionId = null
      }
    },
    onCancel: () => {
      recordingActionId = null
    },
    onClear: () => {
      if (recordingActionId) {
        shortcuts = {
          ...shortcuts,
          [recordingActionId]: [],
        }
        recordingActionId = null
      }
    },
  })

  createHotkeySequence(
    () => resolveSeq('save'),
    () => {
      saveCount++
    },
    () => ({
      enabled: !recorder.isRecording && resolveSeq('save').length > 0,
    }),
  )

  createHotkeySequence(
    () => resolveSeq('open'),
    () => {
      openCount++
    },
    () => ({
      enabled: !recorder.isRecording && resolveSeq('open').length > 0,
    }),
  )

  createHotkeySequence(
    () => resolveSeq('new'),
    () => {
      newCount++
    },
    () => ({
      enabled: !recorder.isRecording && resolveSeq('new').length > 0,
    }),
  )

  createHotkeySequence(
    () => resolveSeq('close'),
    () => {
      closeCount++
    },
    () => ({
      enabled: !recorder.isRecording && resolveSeq('close').length > 0,
    }),
  )

  createHotkeySequence(
    () => resolveSeq('undo'),
    () => {
      undoCount++
    },
    () => ({
      enabled: !recorder.isRecording && resolveSeq('undo').length > 0,
    }),
  )

  createHotkeySequence(
    () => resolveSeq('redo'),
    () => {
      redoCount++
    },
    () => ({
      enabled: !recorder.isRecording && resolveSeq('redo').length > 0,
    }),
  )

  function handleEdit(actionId: string) {
    recordingActionId = actionId
    recorder.startRecording()
  }

  function handleCancel() {
    recorder.cancelRecording()
    recordingActionId = null
  }
</script>

<div class="app">
  <header>
    <h1>Sequence shortcut settings</h1>
    <p>
      Customize Vim-style sequences. Click Edit, press each chord in order, then
      Enter to save. Escape cancels; Backspace removes the last chord or clears
      when empty.
    </p>
  </header>

  <main>
    <section class="demo-section">
      <h2>Shortcuts</h2>
      <div class="shortcuts-list">
        {#each Object.entries(DEFAULT_SHORTCUT_ACTIONS) as [actionId, action]}
          <ShortcutListItem
            actionName={action.name}
            sequence={resolveSeq(actionId)}
            disabled={resolveSeq(actionId).length === 0}
            liveSteps={recorder.steps}
            isRecording={recorder.isRecording && recordingActionId === actionId}
            onEdit={() => handleEdit(actionId)}
            onCancel={handleCancel}
          />
        {/each}
      </div>
    </section>

    <section class="demo-section">
      <h2>Demo actions</h2>
      <p>Try your sequences within the default timeout window.</p>
      <div class="demo-stats">
        <div class="stat-item">
          <div class="stat-label">Save</div>
          <div class="stat-value">{saveCount}</div>
          <kbd>{formatStat('save')}</kbd>
        </div>
        <div class="stat-item">
          <div class="stat-label">Open</div>
          <div class="stat-value">{openCount}</div>
          <kbd>{formatStat('open')}</kbd>
        </div>
        <div class="stat-item">
          <div class="stat-label">New</div>
          <div class="stat-value">{newCount}</div>
          <kbd>{formatStat('new')}</kbd>
        </div>
        <div class="stat-item">
          <div class="stat-label">Close</div>
          <div class="stat-value">{closeCount}</div>
          <kbd>{formatStat('close')}</kbd>
        </div>
        <div class="stat-item">
          <div class="stat-label">Undo</div>
          <div class="stat-value">{undoCount}</div>
          <kbd>{formatStat('undo')}</kbd>
        </div>
        <div class="stat-item">
          <div class="stat-label">Redo</div>
          <div class="stat-value">{redoCount}</div>
          <kbd>{formatStat('redo')}</kbd>
        </div>
      </div>
    </section>

    {#if recorder.isRecording}
      <div class="info-box recording-notice">
        <strong>Recording sequence…</strong> Press each chord, then Enter to
        finish. Escape cancels. Backspace removes the last chord or clears.
        {#if recorder.steps.length > 0}
          <div>
            Steps: {recorder.steps.map((h) => formatForDisplay(h)).join(' ')}
          </div>
        {/if}
      </div>
    {/if}

    <section class="demo-section">
      <h2>Usage</h2>
      <pre class="code-block">{`import {
  createHotkeySequence,
  createHotkeySequenceRecorder,
} from '@tanstack/svelte-hotkeys'

createHotkeySequence(['G', 'G'], () => goTop(), () => ({
  enabled: !recorder.isRecording,
}))`}</pre>
    </section>
  </main>
</div>
