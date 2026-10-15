<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import {
  HotkeysProvider,
  formatForDisplay,
  useHotkeyRecorder,
  useHotkeyRegistrations,
  useHotkeys,
} from '@tanstack/vue-hotkeys'
import { HotkeysDevtoolsPanel } from '@tanstack/vue-hotkeys-devtools'
import { computed, ref } from 'vue'
import ShortcutListItem from './ShortcutListItem.vue'
import type { Hotkey } from '@tanstack/vue-hotkeys'

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

const shortcuts = ref<Array<Shortcut>>([...INITIAL_SHORTCUTS])

// Track which shortcut is being edited
const editingId = ref<string | null>(null)
const draftName = ref('')
const draftDescription = ref('')

const plugins = [{ name: 'TanStack Hotkeys', component: HotkeysDevtoolsPanel }]

const recorder = useHotkeyRecorder({
  // Record up to four chords; Enter or the fourth chord commits.
  maxSteps: 4,
  onRecord: (hotkey: Hotkey) => {
    if (editingId.value) {
      shortcuts.value = shortcuts.value.map((s) =>
        s.id === editingId.value
          ? {
              ...s,
              hotkey,
              name: draftName.value,
              description: draftDescription.value,
            }
          : s,
      )
      editingId.value = null
    }
  },
  onCancel: () => {
    // If this was a brand-new shortcut with no hotkey yet, remove it
    if (editingId.value) {
      const shortcut = shortcuts.value.find((s) => s.id === editingId.value)
      if (shortcut && shortcut.hotkey === null) {
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
              hotkey: null,
              name: draftName.value,
              description: draftDescription.value,
            }
          : s,
      )
      editingId.value = null
    }
  },
})

// Register every assigned shortcut, chords and sequences alike, with meta
useHotkeys(() =>
  shortcuts.value.flatMap((s) =>
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

const registrations = useHotkeyRegistrations()

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
    hotkey: null,
  }
  shortcuts.value = [...shortcuts.value, newShortcut]
  editingId.value = newShortcut.id
  draftName.value = ''
  draftDescription.value = ''
  recorder.startRecording()
}

const recordingStepsDisplay = computed(() =>
  formatForDisplay(recorder.steps.value),
)

const usageCode = `import {
  useHotkeys,
  useHotkeyRecorder,
  useHotkeyRegistrations,
} from '@tanstack/vue-hotkeys'

// Record a chord or a sequence of up to four chords
const recorder = useHotkeyRecorder({
  maxSteps: 4,
  onRecord: (hotkey) => save(hotkey), // 'Mod+S' or ['G', 'G']
})

// Register chords and sequences together, with meta
useHotkeys(() =>
  shortcuts.value.map((s) => ({
    hotkey: s.hotkey,
    callback: () => handleAction(s.id),
    options: {
      meta: { name: s.name, description: s.description },
    },
  })),
)

// Read all registrations reactively
const registrations = useHotkeyRegistrations()
// registrations.value[0].options.meta?.name → 'Save'
// registrations.value[0].triggerCount → 3`
</script>

<template>
  <HotkeysProvider>
    <div class="app">
      <header>
        <h1>Recording Sequences</h1>
        <p>
          <code>useHotkeyRecorder</code> with <code>maxSteps</code> records up
          to that many chords. Click Edit, press each chord in order, then press
          Enter (or reach four chords) to save. One chord saves as a regular
          hotkey. Escape cancels; Backspace removes the last chord or clears
          when empty.
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
              :live-steps="recorder.steps.value"
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
          <strong>Recording...</strong> Press up to four chords, then Enter to
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
            use your shortcuts.
          </p>
          <table class="registrations-table">
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
              <tr v-for="reg in registrations" :key="reg.id">
                <td>
                  <kbd>{{ formatForDisplay(reg.hotkey) }}</kbd>
                </td>
                <td>{{ reg.options.meta?.name ?? '\u2014' }}</td>
                <td class="description-cell">
                  {{ reg.options.meta?.description ?? '\u2014' }}
                </td>
                <td>
                  {{
                    reg.kind === 'sequence'
                      ? `${reg.matchedStepCount}/${reg.hotkey.length}`
                      : '\u2014'
                  }}
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
              <tr v-if="registrations.length === 0">
                <td colspan="6" class="hint">No hotkeys registered</td>
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
