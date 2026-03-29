<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import {
  HotkeysProvider,
  formatForDisplay,
  useHotkeyRegistrations,
  useHotkeySequenceRecorder,
  useHotkeySequences,
} from '@tanstack/vue-hotkeys'
import { HotkeysDevtoolsPanel } from '@tanstack/vue-hotkeys-devtools'
import { computed, ref } from 'vue'
import ShortcutListItem from './ShortcutListItem.vue'
import type { HotkeySequence } from '@tanstack/vue-hotkeys'

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

const shortcuts = ref<Array<Shortcut>>([...INITIAL_SHORTCUTS])

// Track which shortcut is being edited
const editingId = ref<string | null>(null)
const draftName = ref('')
const draftDescription = ref('')

const plugins = [{ name: 'TanStack Hotkeys', component: HotkeysDevtoolsPanel }]

const recorder = useHotkeySequenceRecorder({
  onRecord: (sequence: HotkeySequence) => {
    if (editingId.value) {
      shortcuts.value = shortcuts.value.map((s) =>
        s.id === editingId.value
          ? {
              ...s,
              sequence,
              name: draftName.value,
              description: draftDescription.value,
            }
          : s,
      )
      editingId.value = null
    }
  },
  onCancel: () => {
    // If this was a brand-new shortcut with no sequence yet, remove it
    if (editingId.value) {
      const shortcut = shortcuts.value.find((s) => s.id === editingId.value)
      if (shortcut && shortcut.sequence.length === 0) {
        shortcuts.value = shortcuts.value.filter(
          (s) => s.id !== editingId.value,
        )
      }
    }
    editingId.value = null
  },
  onClear: () => {
    if (editingId.value) {
      shortcuts.value = shortcuts.value.map((s) =>
        s.id === editingId.value
          ? {
              ...s,
              sequence: [],
              name: draftName.value,
              description: draftDescription.value,
            }
          : s,
      )
      editingId.value = null
    }
  },
})

// Register all sequences with meta
useHotkeySequences(() =>
  shortcuts.value
    .filter((s) => s.sequence.length > 0)
    .map((s) => ({
      sequence: s.sequence,
      callback: () => {
        console.log(`${s.name} triggered:`, s.sequence)
      },
      options: {
        enabled: !recorder.isRecording.value,
        meta: {
          name: s.name,
          description: s.description,
        },
      },
    })),
)

const { sequences: registeredSequences } = useHotkeyRegistrations()

const handleEdit = (id: string) => {
  const shortcut = shortcuts.value.find((s) => s.id === id)
  if (!shortcut) return
  editingId.value = id
  draftName.value = shortcut.name
  draftDescription.value = shortcut.description
  recorder.startRecording()
}

const handleSaveEditing = () => {
  if (editingId.value) {
    shortcuts.value = shortcuts.value.map((s) =>
      s.id === editingId.value
        ? { ...s, name: draftName.value, description: draftDescription.value }
        : s,
    )
    recorder.stopRecording()
    editingId.value = null
  }
}

const handleCancel = () => {
  recorder.cancelRecording()
  // onCancel callback handles cleanup
}

const handleDelete = (id: string) => {
  shortcuts.value = shortcuts.value.filter((s) => s.id !== id)
}

const handleCreateNew = () => {
  const newShortcut: Shortcut = {
    id: createId(),
    name: '',
    description: '',
    sequence: [],
  }
  shortcuts.value = [...shortcuts.value, newShortcut]
  editingId.value = newShortcut.id
  draftName.value = ''
  draftDescription.value = ''
  recorder.startRecording()
}

const recordingStepsDisplay = computed(() =>
  recorder.steps.value.map((h) => formatForDisplay(h)).join(' '),
)

const usageCode = `import {
  useHotkeySequences,
  useHotkeySequenceRecorder,
  useHotkeyRegistrations,
} from '@tanstack/vue-hotkeys'

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
// sequences.value[0].options.meta?.name → 'Save'
// sequences.value[0].triggerCount → 3`
</script>

<template>
  <HotkeysProvider>
    <div class="app">
      <header>
        <h1>Sequence Shortcut Settings</h1>
        <p>
          Customize Vim-style sequences. Click Edit, press each chord in order,
          then press Enter to save. Escape cancels; Backspace removes the last
          chord or clears when empty.
        </p>
      </header>

      <main>
        <section class="demo-section">
          <h2>Shortcuts</h2>
          <div class="shortcuts-list">
            <ShortcutListItem
              v-for="shortcut in shortcuts"
              :key="shortcut.id"
              :shortcut="shortcut"
              :is-editing="editingId === shortcut.id"
              :draft-name="
                editingId === shortcut.id ? draftName : shortcut.name
              "
              :draft-description="
                editingId === shortcut.id
                  ? draftDescription
                  : shortcut.description
              "
              :live-steps="recorder.steps"
              @update:draft-name="draftName = $event"
              @update:draft-description="draftDescription = $event"
              @edit="handleEdit(shortcut.id)"
              @save="handleSaveEditing"
              @cancel="handleCancel"
              @delete="handleDelete(shortcut.id)"
            />
          </div>
          <button
            type="button"
            class="create-button"
            :disabled="recorder.isRecording.value"
            @click="handleCreateNew"
          >
            + Create New Shortcut
          </button>
        </section>

        <div
          v-if="recorder.isRecording.value"
          class="info-box recording-notice"
        >
          <strong>Recording sequence...</strong> Press each chord, then Enter to
          finish. Escape cancels. Backspace removes the last chord or clears.
          <div v-if="recorder.steps.value.length > 0">
            Steps: <kbd>{{ recordingStepsDisplay }}</kbd>
          </div>
        </div>

        <!-- Live Registrations Viewer -->
        <section class="demo-section">
          <h2>Live Registrations</h2>
          <p>
            This table is powered by <code>useHotkeyRegistrations()</code> —
            trigger counts, names, and descriptions update in real-time as you
            use your sequences.
          </p>
          <table class="registrations-table">
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
              <tr v-for="reg in registeredSequences" :key="reg.id">
                <td>
                  <template v-for="(s, i) in reg.sequence" :key="i">
                    {{ i > 0 ? ' ' : '' }}<kbd>{{ formatForDisplay(s) }}</kbd>
                  </template>
                </td>
                <td>{{ reg.options.meta?.name ?? '\u2014' }}</td>
                <td class="description-cell">
                  {{ reg.options.meta?.description ?? '\u2014' }}
                </td>
                <td>
                  <span
                    :class="
                      reg.options.enabled !== false ? 'status-on' : 'status-off'
                    "
                  >
                    {{ reg.options.enabled !== false ? 'yes' : 'no' }}
                  </span>
                </td>
                <td class="trigger-count">{{ reg.triggerCount }}</td>
              </tr>
              <tr v-if="registeredSequences.length === 0">
                <td colspan="5" class="empty-row">No sequences registered</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="demo-section">
          <h2>Usage</h2>
          <pre class="code-block">{{ usageCode }}</pre>
        </section>
      </main>

      <TanStackDevtools :plugins="plugins" />
    </div>
  </HotkeysProvider>
</template>
