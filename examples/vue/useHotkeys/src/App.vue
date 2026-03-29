<script setup lang="ts">
import { computed, ref } from 'vue'
import { TanStackDevtools } from '@tanstack/vue-devtools'
import {
  HotkeysProvider,
  formatForDisplay,
  useHotkeyRegistrations,
  useHotkeys,
} from '@tanstack/vue-hotkeys'
import { HotkeysDevtoolsPanel } from '@tanstack/vue-hotkeys-devtools'
import type { Hotkey, UseHotkeyDefinition } from '@tanstack/vue-hotkeys'

const plugins = [{ name: 'TanStack Hotkeys', component: HotkeysDevtoolsPanel }]

// Basic demo
const log = ref<Array<string>>([])
const saveCount = ref(0)
const undoCount = ref(0)
const redoCount = ref(0)

useHotkeys([
  {
    hotkey: 'Shift+S',
    callback: (_e, { hotkey }) => {
      saveCount.value++
      log.value = [`${hotkey} pressed`, ...log.value].slice(0, 20)
    },
    options: {
      meta: { name: 'Save', description: 'Save the current document' },
    },
  },
  {
    hotkey: 'Shift+U',
    callback: (_e, { hotkey }) => {
      undoCount.value++
      log.value = [`${hotkey} pressed`, ...log.value].slice(0, 20)
    },
    options: {
      meta: { name: 'Undo', description: 'Undo the last action' },
    },
  },
  {
    hotkey: 'Shift+R',
    callback: (_e, { hotkey }) => {
      redoCount.value++
      log.value = [`${hotkey} pressed`, ...log.value].slice(0, 20)
    },
    options: {
      meta: { name: 'Redo', description: 'Redo the last undone action' },
    },
  },
])

// Common options demo
const commonEnabled = ref(true)
const counts = ref({ a: 0, b: 0, c: 0 })

useHotkeys(
  [
    {
      hotkey: 'Alt+J',
      callback: () => {
        counts.value = { ...counts.value, a: counts.value.a + 1 }
      },
      options: {
        meta: {
          name: 'Action A',
          description: 'First action (respects toggle)',
        },
      },
    },
    {
      hotkey: 'Alt+K',
      callback: () => {
        counts.value = { ...counts.value, b: counts.value.b + 1 }
      },
      options: {
        meta: {
          name: 'Action B',
          description: 'Second action (respects toggle)',
        },
      },
    },
    {
      hotkey: 'Alt+L',
      callback: () => {
        counts.value = { ...counts.value, c: counts.value.c + 1 }
      },
      options: {
        enabled: true,
        meta: {
          name: 'Action C',
          description: 'Always-on action (overrides toggle)',
        },
      },
    },
  ],
  () => ({ enabled: commonEnabled.value }),
)

// Dynamic demo
interface DynamicShortcut {
  id: number
  hotkey: string
  label: string
  description: string
  count: number
}

let nextId = 0

const shortcuts = ref<Array<DynamicShortcut>>([
  {
    id: nextId++,
    hotkey: 'Shift+A',
    label: 'Action A',
    description: 'First dynamic action',
    count: 0,
  },
  {
    id: nextId++,
    hotkey: 'Shift+B',
    label: 'Action B',
    description: 'Second dynamic action',
    count: 0,
  },
  {
    id: nextId++,
    hotkey: 'Shift+C',
    label: 'Action C',
    description: 'Third dynamic action',
    count: 0,
  },
])

const newHotkey = ref('')
const newLabel = ref('')
const newDescription = ref('')

const dynamicDefinitions = computed<Array<UseHotkeyDefinition>>(() =>
  shortcuts.value.map((s) => ({
    hotkey: s.hotkey as Hotkey,
    callback: () => {
      shortcuts.value = shortcuts.value.map((item) =>
        item.id === s.id ? { ...item, count: item.count + 1 } : item,
      )
    },
    options: {
      meta: { name: s.label, description: s.description },
    },
  })),
)

useHotkeys(dynamicDefinitions)

function addShortcut() {
  const trimmed = newHotkey.value.trim()
  if (!trimmed || !newLabel.value.trim()) return
  shortcuts.value = [
    ...shortcuts.value,
    {
      id: nextId++,
      hotkey: trimmed,
      label: newLabel.value.trim(),
      description: newDescription.value.trim(),
      count: 0,
    },
  ]
  newHotkey.value = ''
  newLabel.value = ''
  newDescription.value = ''
}

function removeShortcut(id: number) {
  shortcuts.value = shortcuts.value.filter((s) => s.id !== id)
}

function fd(h: string) {
  return formatForDisplay(h as Hotkey)
}

// Registrations viewer
const { hotkeys: registeredHotkeys, sequences: registeredSequences } =
  useHotkeyRegistrations()
</script>

<template>
  <HotkeysProvider>
    <div class="app">
      <header>
        <h1>useHotkeys</h1>
        <p>
          Register multiple hotkeys in a single composable call. Supports
          dynamic arrays for variable-length shortcut lists.
        </p>
      </header>

      <!-- Basic Multi-Hotkey -->
      <div class="demo-section">
        <h2>Basic Multi-Hotkey Registration</h2>
        <p>
          All three hotkeys are registered in a single
          <code>useHotkeys()</code> call with <code>meta</code> for name and
          description.
        </p>
        <div class="hotkey-grid">
          <div>
            <kbd>{{ fd('Shift+S') }}</kbd> Save ({{ saveCount }})
          </div>
          <div>
            <kbd>{{ fd('Shift+U') }}</kbd> Undo ({{ undoCount }})
          </div>
          <div>
            <kbd>{{ fd('Shift+R') }}</kbd> Redo ({{ redoCount }})
          </div>
        </div>
        <div v-if="log.length > 0" class="log">
          <div v-for="(entry, i) in log" :key="i" class="log-entry">
            {{ entry }}
          </div>
        </div>
        <pre class="code-block">
useHotkeys([
  {
    hotkey: 'Shift+S',
    callback: () => save(),
    options: { meta: { name: 'Save', description: 'Save the document' } },
  },
  {
    hotkey: 'Shift+U',
    callback: () => undo(),
    options: { meta: { name: 'Undo', description: 'Undo the last action' } },
  },
])</pre
        >
      </div>

      <!-- Common Options -->
      <div class="demo-section">
        <h2>Common Options with Per-Hotkey Overrides</h2>
        <p>
          <kbd>{{ fd('Alt+J') }}</kbd> and <kbd>{{ fd('Alt+K') }}</kbd> respect
          the global toggle. <kbd>{{ fd('Alt+L') }}</kbd> overrides
          <code>enabled: true</code> so it always works.
        </p>
        <div style="margin-bottom: 12px">
          <button @click="commonEnabled = !commonEnabled">
            {{ commonEnabled ? 'Disable' : 'Enable' }} common hotkeys
          </button>
        </div>
        <div class="hotkey-grid">
          <div>
            <kbd>{{ fd('Alt+J') }}</kbd> Action A ({{ counts.a }})
          </div>
          <div>
            <kbd>{{ fd('Alt+K') }}</kbd> Action B ({{ counts.b }})
          </div>
          <div>
            <kbd>{{ fd('Alt+L') }}</kbd> Action C ({{ counts.c }})
            <span class="hint"> (always on)</span>
          </div>
        </div>
        <pre class="code-block">
useHotkeys(
  [
    { hotkey: 'Alt+J', callback: () => actionA(),
      options: { meta: { name: 'Action A' } } },
    { hotkey: 'Alt+L', callback: () => actionC(),
      options: { enabled: true, meta: { name: 'Action C' } } },
  ],
  { enabled }, // common option
)</pre
        >
      </div>

      <!-- Dynamic -->
      <div class="demo-section">
        <h2>Dynamic Hotkey List</h2>
        <p>
          Add or remove hotkeys at runtime. Because <code>useHotkeys</code>
          accepts a dynamic array, this works without any special handling.
        </p>
        <div class="dynamic-list">
          <div v-for="s in shortcuts" :key="s.id" class="dynamic-item">
            <kbd>{{ fd(s.hotkey) }}</kbd>
            <span>{{ s.label }}</span>
            <span class="count">{{ s.count }}</span>
            <button @click="removeShortcut(s.id)">Remove</button>
          </div>
          <p v-if="shortcuts.length === 0" class="hint">
            No shortcuts registered. Add one below.
          </p>
        </div>
        <div class="add-form">
          <input
            v-model="newHotkey"
            type="text"
            placeholder="Hotkey (e.g. Shift+D)"
            @keydown.enter="addShortcut"
          />
          <input
            v-model="newLabel"
            type="text"
            placeholder="Name (e.g. Action D)"
            @keydown.enter="addShortcut"
          />
          <input
            v-model="newDescription"
            type="text"
            placeholder="Description (optional)"
            @keydown.enter="addShortcut"
          />
          <button :disabled="!newHotkey || !newLabel" @click="addShortcut">
            Add
          </button>
        </div>
        <pre class="code-block">
const shortcuts = useShortcutsConfig() // dynamic data

useHotkeys(
  shortcuts.map((s) => ({
    hotkey: s.key,
    callback: s.action,
    options: { meta: { name: s.name, description: s.description } },
  })),
)</pre
        >
      </div>

      <!-- Live Registrations Viewer -->
      <div class="demo-section">
        <h2>Live Registrations (useHotkeyRegistrations)</h2>
        <p>
          This table is rendered from
          <code>useHotkeyRegistrations()</code> — a reactive view of all
          registered hotkeys. It updates automatically as hotkeys are added,
          removed, enabled/disabled, or triggered.
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
              <td colspan="5" class="hint">No hotkeys registered</td>
            </tr>
          </tbody>
        </table>
        <template v-if="registeredSequences.length > 0">
          <h3 style="margin-top: 16px">Sequences</h3>
          <table class="registrations-table">
            <thead>
              <tr>
                <th>Sequence</th>
                <th>Name</th>
                <th>Description</th>
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
                <td class="trigger-count">{{ reg.triggerCount }}</td>
              </tr>
            </tbody>
          </table>
        </template>
        <pre class="code-block">
const { hotkeys, sequences } = useHotkeyRegistrations()

// Render a live table of all registrations
hotkeys.value.map((reg) => ({
  hotkey: formatForDisplay(reg.hotkey),
  name: reg.options.meta?.name,
  description: reg.options.meta?.description,
  triggers: reg.triggerCount,
}))</pre
        >
      </div>
    </div>

    <TanStackDevtools :plugins="plugins" />
  </HotkeysProvider>
</template>
