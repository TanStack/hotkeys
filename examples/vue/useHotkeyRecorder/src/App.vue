<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import {
  HotkeysProvider,
  formatForDisplay,
  useHotkey,
  useHotkeyRecorder,
} from '@tanstack/vue-hotkeys'
import { HotkeysDevtoolsPanel } from '@tanstack/vue-hotkeys-devtools'
import { ref } from 'vue'
import ShortcutListItem from './ShortcutListItem.vue'
import type { Hotkey } from '@tanstack/vue-hotkeys'

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

const shortcuts = ref<Record<string, Hotkey | ''>>(
  Object.fromEntries(
    Object.entries(DEFAULT_SHORTCUT_ACTIONS).map(([id, action]) => [
      id,
      action.defaultHotkey,
    ]),
  ) as Record<string, Hotkey | ''>,
)

const saveCount = ref(0)
const openCount = ref(0)
const newCount = ref(0)
const closeCount = ref(0)
const undoCount = ref(0)
const redoCount = ref(0)
const recordingActionId = ref<string | null>(null)
const plugins = [{ name: 'TanStack Hotkeys', component: HotkeysDevtoolsPanel }]

const recorder = useHotkeyRecorder({
  onRecord: (hotkey: Hotkey) => {
    if (recordingActionId.value) {
      shortcuts.value = {
        ...shortcuts.value,
        [recordingActionId.value]: hotkey,
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
        [recordingActionId.value]: '' as Hotkey | '',
      }
      recordingActionId.value = null
    }
  },
})

useHotkey(
  () => shortcuts.value.save || DEFAULT_SHORTCUT_ACTIONS.save.defaultHotkey,
  () => {
    console.log('Save triggered:', shortcuts.value.save)
    saveCount.value++
  },
  {
    enabled: () => !recorder.isRecording.value && shortcuts.value.save !== '',
  },
)

useHotkey(
  () => shortcuts.value.open || DEFAULT_SHORTCUT_ACTIONS.open.defaultHotkey,
  () => {
    console.log('Open triggered:', shortcuts.value.open)
    openCount.value++
  },
  {
    enabled: () => !recorder.isRecording.value && shortcuts.value.open !== '',
  },
)

useHotkey(
  () => shortcuts.value.new || DEFAULT_SHORTCUT_ACTIONS.new.defaultHotkey,
  () => {
    console.log('New triggered:', shortcuts.value.new)
    newCount.value++
  },
  {
    enabled: () => !recorder.isRecording.value && shortcuts.value.new !== '',
  },
)

useHotkey(
  () => shortcuts.value.close || DEFAULT_SHORTCUT_ACTIONS.close.defaultHotkey,
  () => {
    console.log('Close triggered:', shortcuts.value.close)
    closeCount.value++
  },
  {
    enabled: () => !recorder.isRecording.value && shortcuts.value.close !== '',
  },
)

useHotkey(
  () => shortcuts.value.undo || DEFAULT_SHORTCUT_ACTIONS.undo.defaultHotkey,
  () => {
    console.log('Undo triggered:', shortcuts.value.undo)
    undoCount.value++
  },
  {
    enabled: () => !recorder.isRecording.value && shortcuts.value.undo !== '',
  },
)

useHotkey(
  () => shortcuts.value.redo || DEFAULT_SHORTCUT_ACTIONS.redo.defaultHotkey,
  () => {
    console.log('Redo triggered:', shortcuts.value.redo)
    redoCount.value++
  },
  {
    enabled: () => !recorder.isRecording.value && shortcuts.value.redo !== '',
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

const usageCode = `import { useHotkey, formatForDisplay } from '@tanstack/vue-hotkeys'

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
}`
</script>

<template>
  <HotkeysProvider>
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
            <ShortcutListItem
              v-for="(action, actionId) in DEFAULT_SHORTCUT_ACTIONS"
              :key="actionId"
              :action-name="action.name"
              :hotkey="shortcuts[actionId] || ''"
              :is-recording="
                recorder.isRecording && recordingActionId === actionId
              "
              @edit="handleEdit(actionId)"
              @cancel="handleCancel"
            />
          </div>
        </section>

        <section class="demo-section">
          <h2>Demo Actions</h2>
          <p>Try your shortcuts! Actions will trigger when you press them.</p>
          <div class="demo-stats">
            <div class="stat-item">
              <div class="stat-label">Save</div>
              <div class="stat-value">{{ saveCount }}</div>
              <kbd>{{ formatForDisplay(shortcuts.save || 'Mod+K') }}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Open</div>
              <div class="stat-value">{{ openCount }}</div>
              <kbd>{{ formatForDisplay(shortcuts.open || 'Mod+E') }}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">New</div>
              <div class="stat-value">{{ newCount }}</div>
              <kbd>{{ formatForDisplay(shortcuts.new || 'Mod+G') }}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Close</div>
              <div class="stat-value">{{ closeCount }}</div>
              <kbd>{{
                formatForDisplay(shortcuts.close || 'Mod+Shift+K')
              }}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Undo</div>
              <div class="stat-value">{{ undoCount }}</div>
              <kbd>{{ formatForDisplay(shortcuts.undo || 'Mod+Shift+E') }}</kbd>
            </div>
            <div class="stat-item">
              <div class="stat-label">Redo</div>
              <div class="stat-value">{{ redoCount }}</div>
              <kbd>{{ formatForDisplay(shortcuts.redo || 'Mod+Shift+G') }}</kbd>
            </div>
          </div>
        </section>

        <div v-if="recorder.isRecording" class="info-box recording-notice">
          <strong>Recording shortcut...</strong> Press any key combination or
          Escape to cancel. Press Backspace/Delete to clear the shortcut.
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
