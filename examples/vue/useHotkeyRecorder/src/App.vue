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
import { ref } from 'vue'
import ShortcutListItem from './ShortcutListItem.vue'
import type { Hotkey } from '@tanstack/vue-hotkeys'

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
    hotkey: 'Mod+K',
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

const shortcuts = ref<Array<Shortcut>>([...INITIAL_SHORTCUTS])

// Track which shortcut is being edited (recording + name/description editing)
const editingId = ref<string | null>(null)
// Draft name/description while editing
const draftName = ref('')
const draftDescription = ref('')

const plugins = [{ name: 'TanStack Hotkeys', component: HotkeysDevtoolsPanel }]

const recorder = useHotkeyRecorder({
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
      if (shortcut && shortcut.hotkey === '') {
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
              hotkey: '' as Hotkey | '',
              name: draftName.value,
              description: draftDescription.value,
            }
          : s,
      )
      editingId.value = null
    }
  },
})

// Register all shortcuts with meta
useHotkeys(() =>
  shortcuts.value
    .filter((s) => s.hotkey !== '')
    .map((s) => ({
      hotkey: s.hotkey as Hotkey,
      callback: () => {
        console.log(`${s.name} triggered:`, s.hotkey)
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

const { hotkeys: registeredHotkeys } = useHotkeyRegistrations()

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
    // Save draft name/description, keep current hotkey, stop recording
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
    hotkey: '',
  }
  shortcuts.value = [...shortcuts.value, newShortcut]
  editingId.value = newShortcut.id
  draftName.value = ''
  draftDescription.value = ''
  recorder.startRecording()
}

const usageCode = `import {
  useHotkeys,
  useHotkeyRecorder,
  useHotkeyRegistrations,
} from '@tanstack/vue-hotkeys'

// Register shortcuts dynamically with meta
useHotkeys(
  shortcuts.map((s) => ({
    hotkey: s.hotkey,
    callback: () => handleAction(s.id),
    options: {
      enabled: !isRecording,
      meta: { name: s.name, description: s.description },
    },
  })),
)

// Read all registrations reactively
const { hotkeys } = useHotkeyRegistrations()
// hotkeys.value[0].options.meta?.name → 'Save'
// hotkeys.value[0].triggerCount → 3`
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
          <strong>Recording shortcut...</strong> Press any key combination or
          Escape to cancel. Press Backspace/Delete to clear the shortcut.
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
                <th>Enabled</th>
                <th>Triggers</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="reg in registeredHotkeys" :key="reg.id">
                <td>
                  <kbd>{{ formatForDisplay(reg.hotkey) }}</kbd>
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
              <tr v-if="registeredHotkeys.length === 0">
                <td colspan="5" class="empty-row">No hotkeys registered</td>
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
