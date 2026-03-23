<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import {
  HotkeysProvider,
  formatForDisplay,
  useHotkeySequence,
  useHotkeySequenceRecorder,
} from '@tanstack/vue-hotkeys'
import { HotkeysDevtoolsPanel } from '@tanstack/vue-hotkeys-devtools'
import { computed } from 'vue'
import ShortcutListItem from './ShortcutListItem.vue'
import type { HotkeySequence } from '@tanstack/vue-hotkeys'

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

const shortcuts = ref<Record<string, HotkeySequence | null>>(
  Object.fromEntries(
    Object.keys(DEFAULT_SHORTCUT_ACTIONS).map((id) => [id, null]),
  ) as Record<string, HotkeySequence | null>,
)

function resolveSeq(actionId: string): HotkeySequence {
  const s = shortcuts.value[actionId]
  if (s !== null) {
    return s
  }
  return DEFAULT_SHORTCUT_ACTIONS[actionId]!.defaultSequence
}

const saveCount = ref(0)
const openCount = ref(0)
const newCount = ref(0)
const closeCount = ref(0)
const undoCount = ref(0)
const redoCount = ref(0)
const recordingActionId = ref<string | null>(null)
const plugins = [{ name: 'TanStack Hotkeys', component: HotkeysDevtoolsPanel }]

const recorder = useHotkeySequenceRecorder({
  onRecord: (sequence: HotkeySequence) => {
    if (recordingActionId.value) {
      shortcuts.value = {
        ...shortcuts.value,
        [recordingActionId.value]: sequence,
      }
      recordingActionId.value = null
    }
  },
  onCancel: () => {
    recordingActionId.value = null
  },
  onClear: () => {
    if (recordingActionId.value) {
      shortcuts.value = {
        ...shortcuts.value,
        [recordingActionId.value]: [],
      }
      recordingActionId.value = null
    }
  },
})

useHotkeySequence(
  () => resolveSeq('save'),
  () => {
    console.log('Save triggered')
    saveCount.value++
  },
  {
    enabled: () => !recorder.isRecording.value && resolveSeq('save').length > 0,
  },
)

useHotkeySequence(
  () => resolveSeq('open'),
  () => {
    console.log('Open triggered')
    openCount.value++
  },
  {
    enabled: () => !recorder.isRecording.value && resolveSeq('open').length > 0,
  },
)

useHotkeySequence(
  () => resolveSeq('new'),
  () => {
    console.log('New triggered')
    newCount.value++
  },
  {
    enabled: () => !recorder.isRecording.value && resolveSeq('new').length > 0,
  },
)

useHotkeySequence(
  () => resolveSeq('close'),
  () => {
    console.log('Close triggered')
    closeCount.value++
  },
  {
    enabled: () =>
      !recorder.isRecording.value && resolveSeq('close').length > 0,
  },
)

useHotkeySequence(
  () => resolveSeq('undo'),
  () => {
    console.log('Undo triggered')
    undoCount.value++
  },
  {
    enabled: () => !recorder.isRecording.value && resolveSeq('undo').length > 0,
  },
)

useHotkeySequence(
  () => resolveSeq('redo'),
  () => {
    console.log('Redo triggered')
    redoCount.value++
  },
  {
    enabled: () => !recorder.isRecording.value && resolveSeq('redo').length > 0,
  },
)

const handleEdit = (actionId: string) => {
  recordingActionId.value = actionId
  recorder.startRecording()
}

const handleCancel = () => {
  recorder.cancelRecording()
  recordingActionId.value = null
}

const usageCode = `import { useHotkeySequence } from '@tanstack/vue-hotkeys'

useHotkeySequence(['G', 'G'], () => goTop(), { enabled: !isRecording })`

const formatStat = (id: string) => {
  const seq = resolveSeq(id)
  if (seq.length === 0) {
    return '—'
  }
  return seq.map((h) => formatForDisplay(h)).join(' ')
}

const recordingStepsDisplay = computed(() =>
  recorder.steps.value.map((h) => formatForDisplay(h)).join(' '),
)
</script>

<template>
  <HotkeysProvider>
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
            <ShortcutListItem
              v-for="(action, actionId) in DEFAULT_SHORTCUT_ACTIONS"
              :key="actionId"
              :action-name="action.name"
              :sequence="resolveSeq(actionId)"
              :disabled="resolveSeq(actionId).length === 0"
              :live-steps="recorder.steps"
              :is-recording="
                recorder.isRecording && recordingActionId === actionId
              "
              @edit="handleEdit(actionId)"
              @cancel="handleCancel"
            />
          </div>
        </section>

        <section class="demo-section">
          <h2>Demo actions</h2>
          <p>Try your sequences within the default timeout window.</p>
          <div class="demo-stats">
            <div class="stat-item">
              <div class="stat-label">Save</div>
              <div class="stat-value">{{ saveCount }}</div>
              <kbd>{{ formatStat('save') }}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Open</div>
              <div class="stat-value">{{ openCount }}</div>
              <kbd>{{ formatStat('open') }}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">New</div>
              <div class="stat-value">{{ newCount }}</div>
              <kbd>{{ formatStat('new') }}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Close</div>
              <div class="stat-value">{{ closeCount }}</div>
              <kbd>{{ formatStat('close') }}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Undo</div>
              <div class="stat-value">{{ undoCount }}</div>
              <kbd>{{ formatStat('undo') }}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Redo</div>
              <div class="stat-value">{{ redoCount }}</div>
              <kbd>{{ formatStat('redo') }}</kbd>
            </div>
          </div>
        </section>

        <div v-if="recorder.isRecording" class="info-box recording-notice">
          <strong>Recording sequence…</strong> Press each chord, then Enter to
          finish. Escape cancels. Backspace removes the last chord or clears.
          <div v-if="recorder.steps.length > 0">
            Steps: <kbd>{{ recordingStepsDisplay }}</kbd>
          </div>
        </div>

        <section class="demo-section">
          <h2>Usage</h2>
          <pre class="code-block">{{ usageCode }}</pre>
        </section>
      </main>

      <TanStackDevtools :plugins="plugins" />
    </div>
  </HotkeysProvider>
</template>
