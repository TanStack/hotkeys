<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { useFormatForDisplay, useHotkeys } from '@tanstack/vue-hotkeys'
import { HotkeysDevtoolsPanel } from '@tanstack/vue-hotkeys-devtools'
import { ref } from 'vue'
import type { Hotkey } from '@tanstack/vue-hotkeys'

interface Shortcut {
  hotkey: Hotkey
  name: string
}

// These type-check because German keys are registered in index.ts.
const germanShortcuts: Array<Shortcut> = [
  { hotkey: 'Mod+Ö', name: 'Toggle comment' },
  { hotkey: 'Mod+Shift+Ä', name: 'Add annotation' },
  { hotkey: 'ß', name: 'Toggle sidebar' },
  { hotkey: '§', name: 'Show sections' },
]

// A to Z, 0 to 9, named keys, and physical codes type-check under every
// registration, and fire on every layout.
const everyLayoutShortcuts: Array<Shortcut> = [
  { hotkey: 'Mod+K', name: 'Open command palette' },
  { hotkey: 'Alt+[Digit1]', name: 'Go to the first tab' },
  { hotkey: 'Escape', name: 'Clear' },
]

const sections = [
  {
    title: 'German keys',
    note: 'Switch your keyboard layout to German to press these.',
    shortcuts: germanShortcuts,
  },
  { title: 'Keys on every layout', shortcuts: everyLayoutShortcuts },
]

const formatForDisplay = useFormatForDisplay()
const counts = ref<Record<string, number>>({})
const lastFired = ref<Hotkey | null>(null)

useHotkeys(
  [...germanShortcuts, ...everyLayoutShortcuts].map((shortcut) => ({
    hotkey: shortcut.hotkey,
    callback: () => {
      counts.value[shortcut.name] = (counts.value[shortcut.name] ?? 0) + 1
      lastFired.value = shortcut.hotkey
    },
  })),
)

const plugins = [{ name: 'TanStack Hotkeys', component: HotkeysDevtoolsPanel }]

const usageCode = `import type { GermanKeys, UsKeys } from '@tanstack/vue-hotkeys'

declare module '@tanstack/vue-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}

useHotkey('Mod+Ö', toggleComment) // OK
useHotkey('Mod+[', outdent) // OK, because UsKeys is listed
useHotkey('Mod+Ñ', x) // Type error: Spanish isn't registered`
</script>

<template>
  <div class="app">
    <header>
      <h1>Keyboard Layouts</h1>
      <p>
        Registering a layout lets hotkey strings accept the keys it types, such
        as Ö and ß. It changes types only: these hotkeys match the same way
        without it.
      </p>
    </header>

    <main>
      <section
        v-for="section in sections"
        :key="section.title"
        class="demo-section"
      >
        <h2>{{ section.title }}</h2>
        <p v-if="section.note" class="note">{{ section.note }}</p>
        <div class="hotkey-list">
          <div
            v-for="shortcut in section.shortcuts"
            :key="shortcut.name"
            class="hotkey-row"
            :class="{ fired: lastFired === shortcut.hotkey }"
          >
            <span>
              <kbd>{{ formatForDisplay(shortcut.hotkey) }}</kbd>
              {{ shortcut.name }}
            </span>
            <span class="count">{{ counts[shortcut.name] ?? 0 }}×</span>
          </div>
        </div>
      </section>

      <section class="demo-section">
        <h2>Usage</h2>
        <pre class="code-block">{{ usageCode }}</pre>
      </section>
    </main>

    <TanStackDevtools :plugins="plugins" />
  </div>
</template>
