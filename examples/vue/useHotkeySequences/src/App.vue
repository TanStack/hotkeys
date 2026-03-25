<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import {
  HotkeysProvider,
  useHotkey,
  useHotkeySequences,
} from '@tanstack/vue-hotkeys'
import { HotkeysDevtoolsPanel } from '@tanstack/vue-hotkeys-devtools'
import { ref } from 'vue'

const lastSequence = ref<string | null>(null)
const history = ref<Array<string>>([])
const helloSequenceEnabled = ref(true)
const plugins = [{ name: 'TanStack Hotkeys', component: HotkeysDevtoolsPanel }]

const addToHistory = (action: string) => {
  lastSequence.value = action
  history.value = [...history.value.slice(-9), action]
}

useHotkeySequences([
  { sequence: ['G', 'G'], callback: () => addToHistory('gg → Go to top') },
  {
    sequence: ['Shift+G'],
    callback: () => addToHistory('G → Go to bottom'),
  },
  { sequence: ['D', 'D'], callback: () => addToHistory('dd → Delete line') },
  {
    sequence: ['Y', 'Y'],
    callback: () => addToHistory('yy → Yank (copy) line'),
  },
  { sequence: ['D', 'W'], callback: () => addToHistory('dw → Delete word') },
  {
    sequence: ['C', 'I', 'W'],
    callback: () => addToHistory('ciw → Change inner word'),
  },
  {
    sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
    callback: () => addToHistory('↑↑↓↓ → Konami code (partial)'),
    options: { timeout: 1500 },
  },
  {
    sequence: ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
    callback: () => addToHistory('←→←→ → Side to side!'),
    options: { timeout: 1500 },
  },
  {
    sequence: ['H', 'E', 'L', 'L', 'O'],
    callback: () => addToHistory('hello → Hello World!'),
    options: () => ({ enabled: helloSequenceEnabled.value }),
  },
  {
    sequence: ['Shift+R', 'Shift+T'],
    callback: () => addToHistory('⇧R ⇧T → Chained Shift+letter (2 steps)'),
  },
])

useHotkey('Escape', () => {
  lastSequence.value = null
  history.value = []
})

const usageCode = `<script setup lang="ts">
import { useHotkeySequences } from '@tanstack/vue-hotkeys'

useHotkeySequences([
  { sequence: ['g', 'g'], callback: () => scrollToTop() },
  {
    sequence: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
    callback: () => activateCheatMode(),
    options: { timeout: 1500 },
  },
  { sequence: ['C', 'I', 'W'], callback: () => changeInnerWord() },
  { sequence: ['Shift+R', 'Shift+T'], callback: () => doSomething() },
])
</${'script'}>`
</script>

<template>
  <HotkeysProvider>
    <div class="app">
      <header>
        <h1>useHotkeySequences</h1>
        <p>
          Register many multi-key sequences in one composable (like Vim
          commands). Keys must be pressed within the timeout window (default:
          1000ms).
        </p>
      </header>

      <main>
        <section class="demo-section">
          <h2>Vim-Style Commands</h2>
          <table class="sequence-table">
            <thead>
              <tr>
                <th>Sequence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><kbd>g</kbd> <kbd>g</kbd></td>
                <td>Go to top</td>
              </tr>
              <tr>
                <td><kbd>G</kbd> (Shift+G)</td>
                <td>Go to bottom</td>
              </tr>
              <tr>
                <td><kbd>d</kbd> <kbd>d</kbd></td>
                <td>Delete line</td>
              </tr>
              <tr>
                <td><kbd>y</kbd> <kbd>y</kbd></td>
                <td>Yank (copy) line</td>
              </tr>
              <tr>
                <td><kbd>d</kbd> <kbd>w</kbd></td>
                <td>Delete word</td>
              </tr>
              <tr>
                <td><kbd>c</kbd> <kbd>i</kbd> <kbd>w</kbd></td>
                <td>Change inner word</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="demo-section">
          <h2>Fun Sequences</h2>
          <div class="fun-sequences">
            <div class="sequence-card">
              <h3>Konami Code (Partial)</h3>
              <p><kbd>↑</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>↓</kbd></p>
              <span class="hint">Use arrow keys within 1.5 seconds</span>
            </div>
            <div class="sequence-card">
              <h3>Side to Side</h3>
              <p><kbd>←</kbd> <kbd>→</kbd> <kbd>←</kbd> <kbd>→</kbd></p>
              <span class="hint">Arrow keys within 1.5 seconds</span>
            </div>
            <div class="sequence-card">
              <h3>Spell It Out</h3>
              <p>
                <kbd>h</kbd> <kbd>e</kbd> <kbd>l</kbd> <kbd>l</kbd> <kbd>o</kbd>
              </p>
              <span class="hint">Type "hello" quickly</span>
              <p class="sequence-toggle-status">
                This sequence is
                <strong>{{
                  helloSequenceEnabled ? 'enabled' : 'disabled'
                }}</strong
                >.
              </p>
              <button
                type="button"
                @click="helloSequenceEnabled = !helloSequenceEnabled"
              >
                {{ helloSequenceEnabled ? 'Disable' : 'Enable' }} sequence
              </button>
            </div>
          </div>
        </section>

        <div v-if="lastSequence" class="info-box success">
          <strong>Triggered:</strong> {{ lastSequence }}
        </div>

        <section class="demo-section">
          <h2>Input handling</h2>
          <p>
            Sequences are not detected when typing in text inputs, textareas,
            selects, or contenteditable elements. Button-type inputs (
            <code>type="button"</code>, <code>submit</code>, <code>reset</code>)
            still receive sequences. Focus the input below and try <kbd>g</kbd>
            <kbd>g</kbd> or <kbd>h</kbd><kbd>e</kbd><kbd>l</kbd><kbd>l</kbd
            ><kbd>o</kbd> — nothing will trigger. Click outside to try again.
          </p>
          <input
            type="text"
            class="demo-input"
            placeholder="Focus here – sequences won't trigger while typing..."
          />
        </section>

        <section class="demo-section">
          <h2>Chained Shift+letter sequences</h2>
          <p>
            Each step is a chord: hold <kbd>Shift</kbd> and press a letter. You
            can press <kbd>Shift</kbd> alone between steps—those modifier-only
            presses do not reset progress, so the next chord still counts.
          </p>
          <table class="sequence-table">
            <thead>
              <tr>
                <th>Sequence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <kbd>Shift</kbd>+<kbd>r</kbd> then <kbd>Shift</kbd>+
                  <kbd>t</kbd>
                </td>
                <td>Chained Shift+letter (2 steps)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="demo-section">
          <h2>Usage</h2>
          <pre class="code-block">{{ usageCode }}</pre>
        </section>

        <section v-if="history.length > 0" class="demo-section">
          <h2>History</h2>
          <ul class="history-list">
            <li v-for="(item, index) in history" :key="index">{{ item }}</li>
          </ul>
          <button type="button" @click="history = []">Clear History</button>
        </section>

        <p class="hint">Press <kbd>Escape</kbd> to clear history</p>
      </main>

      <TanStackDevtools :plugins="plugins" />
    </div>
  </HotkeysProvider>
</template>
