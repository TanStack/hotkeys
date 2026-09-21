<script setup lang="ts">
import { computed, onUnmounted, provide, ref } from 'vue'
import {
  formatForDisplay,
  useHeldKeyCodes,
  useHeldKeys,
  useHotkey,
  useHotkeyRegistrations,
  useHotkeys,
  useKeyHold,
} from '@tanstack/vue-hotkeys'
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/vue-hotkeys-devtools'
import Tickets from './Tickets.vue'
import Editor from './Editor.vue'
import Sequences from './Sequences.vue'
import Recording from './Recording.vue'
import Formatting from './Formatting.vue'
import Hint from './Hint.vue'

const pages = [
  { path: '/', name: 'Tickets', component: Tickets, hotkey: 'Alt+[Digit1]' },
  {
    path: '/editor',
    name: 'Editor',
    component: Editor,
    hotkey: 'Alt+[Digit2]',
  },
  {
    path: '/sequences',
    name: 'Sequences',
    component: Sequences,
    hotkey: 'Alt+[Digit3]',
  },
  {
    path: '/recording',
    name: 'Recording',
    component: Recording,
    hotkey: 'Alt+[Digit4]',
  },
  {
    path: '/formatting',
    name: 'Formatting',
    component: Formatting,
    hotkey: 'Alt+[Digit5]',
  },
] as const
const path = ref(location.hash.slice(1) || '/')
const update = () => {
  path.value = location.hash.slice(1) || '/'
}
window.addEventListener('hashchange', update)
onUnmounted(() => window.removeEventListener('hashchange', update))
const page = computed(
  () => pages.find((p) => p.path === path.value) ?? pages[0],
)
const activity = ref<Array<string>>([])
provide('log', (message: string) => {
  activity.value = [message, ...activity.value].slice(0, 6)
})
const show = ref(false)
const keys = useHeldKeys(),
  codes = useHeldKeyCodes(),
  shift = useKeyHold('Shift')
const { hotkeys, sequences } = useHotkeyRegistrations()
const registrations = computed(() => [...hotkeys.value, ...sequences.value])
useHotkeys(
  pages.map((p) => ({
    hotkey: p.hotkey,
    callback: () => {
      location.hash = p.path
    },
    options: { meta: { name: p.name, group: 'Navigation' } },
  })),
  { ignoreInputs: true },
)
useHotkey(
  'Alt+Shift+[KeyK]',
  () => {
    show.value = !show.value
  },
  { meta: { name: 'Show shortcuts', group: 'Navigation' } },
)
</script>
<template>
  <header>
    <h1>TanStack Hotkeys kitchen sink</h1>
    <p>
      Hold Alt / Option for hints. Route changes mount and unmount
      registrations.
    </p>
    <nav>
      <a
        v-for="p in pages"
        :key="p.path"
        :href="`#${p.path}`"
        :class="{ active: path === p.path }"
        >{{ p.name }} <Hint :hotkey="p.hotkey"
      /></a>
    </nav>
    <button @click="show = !show">
      {{ show ? 'Hide' : 'Show' }} shortcuts
    </button>
  </header>
  <section v-if="show">
    <h2>Live registry</h2>
    <table>
      <thead>
        <tr>
          <th>Group / action</th>
          <th>Binding</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="reg in registrations" :key="reg.id">
          <td>{{ reg.options.meta?.group }} / {{ reg.options.meta?.name }}</td>
          <td>
            {{
              ('hotkey' in reg ? [reg.hotkey] : reg.sequence)
                .map((h) => formatForDisplay(h))
                .join(' → ')
            }}
          </td>
          <td>
            {{
              reg.options.enabled === false
                ? 'Disabled'
                : `${reg.triggerCount} fired`
            }}
          </td>
        </tr>
      </tbody>
    </table>
  </section>
  <main><component :is="page.component" :key="page.path" /></main>
  <section>
    <h2>Key state</h2>
    <p>
      Keys: {{ keys.join(' + ') || 'None' }}<br />Codes:
      {{ Object.values(codes).join(' + ') || 'None' }}<br />Shift:
      {{ shift ? 'held' : 'released' }}
    </p>
    <h2>Activity</h2>
    <button @click="activity = []">Clear log</button>
    <ul aria-live="polite">
      <li v-for="(message, i) in activity" :key="i">{{ message }}</li>
    </ul>
  </section>
  <TanStackDevtools :plugins="[hotkeysDevtoolsPlugin()]" />
</template>
