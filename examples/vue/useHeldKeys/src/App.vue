<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import {
  HotkeysProvider,
  formatForDisplay,
  useHeldKeyCodes,
  useHeldKeys,
} from '@tanstack/vue-hotkeys'
import { HotkeysDevtoolsPanel } from '@tanstack/vue-hotkeys-devtools'
import { ref, watch } from 'vue'

const heldKeys = useHeldKeys()
const heldCodes = useHeldKeyCodes()
const history = ref<Array<string>>([])
const plugins = [{ name: 'TanStack Hotkeys', component: HotkeysDevtoolsPanel }]

watch(heldKeys, (keys) => {
  if (keys.length > 0) {
    const combo = keys
      .map((key) => formatForDisplay(key, { useSymbols: true }))
      .join(' + ')
    history.value =
      history.value[history.value.length - 1] !== combo
        ? [...history.value.slice(-9), combo]
        : history.value
  }
})

const usageCode = `import { useHeldKeys } from '@tanstack/vue-hotkeys'

function KeyDisplay() {
  const heldKeys = useHeldKeys()

  return (
    <div>
      Currently pressed: {heldKeys.join(' + ') || 'None'}
    </div>
  )
}`
</script>

<template>
  <HotkeysProvider>
    <div class="app">
      <header>
        <h1>useHeldKeys</h1>
        <p>
          Returns an array of all currently pressed keys. Useful for displaying
          key combinations or building custom shortcut recording.
        </p>
      </header>

      <main>
        <section class="demo-section">
          <h2>Currently Held Keys</h2>
          <div class="key-display">
            <template v-if="heldKeys.length > 0">
              <template v-for="(key, index) in heldKeys" :key="key">
                <span v-if="index > 0" class="plus">+</span>
                <kbd class="large">
                  {{ formatForDisplay(key, { useSymbols: true }) }}
                  <small
                    v-if="heldCodes[key] && heldCodes[key] !== key"
                    class="code-label"
                  >
                    {{ heldCodes[key] }}
                  </small>
                </kbd>
              </template>
            </template>
            <span v-else class="placeholder">Press any keys...</span>
          </div>
          <div class="stats">
            Keys held: <strong>{{ heldKeys.length }}</strong>
          </div>
        </section>

        <section class="demo-section">
          <h2>Usage</h2>
          <pre class="code-block">{{ usageCode }}</pre>
        </section>

        <section class="demo-section">
          <h2>Try These Combinations</h2>
          <ul>
            <li>Hold <kbd>Shift</kbd> + <kbd>Control</kbd> + <kbd>A</kbd></li>
            <li>Press multiple letter keys at once</li>
            <li>Hold modifiers and watch them appear</li>
            <li>Release keys one by one</li>
          </ul>
        </section>

        <section class="demo-section">
          <h2>Recent Combinations</h2>
          <ul v-if="history.length > 0" class="history-list">
            <li v-for="(combo, index) in history" :key="index">{{ combo }}</li>
          </ul>
          <p v-else class="placeholder">Press some key combinations...</p>
          <button @click="history = []">Clear History</button>
        </section>

        <section class="demo-section">
          <h2>Use Cases</h2>
          <ul>
            <li>Building a keyboard shortcut recorder</li>
            <li>Displaying currently held keys to users</li>
            <li>Debugging keyboard input</li>
            <li>Creating key combination tutorials</li>
          </ul>
        </section>
      </main>

      <TanStackDevtools :plugins="plugins" />
    </div>
  </HotkeysProvider>
</template>
