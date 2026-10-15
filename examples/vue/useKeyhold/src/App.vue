<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { HotkeysProvider, useKeyHold } from '@tanstack/vue-hotkeys'
import { HotkeysDevtoolsPanel } from '@tanstack/vue-hotkeys-devtools'

const isShiftHeld = useKeyHold('Shift')
const isControlHeld = useKeyHold('Control')
const isAltHeld = useKeyHold('Alt')
const isMetaHeld = useKeyHold('Meta')
const isSpaceHeld = useKeyHold('Space')
const plugins = [{ name: 'TanStack Hotkeys', component: HotkeysDevtoolsPanel }]

const usageCode = `import { useKeyHold } from '@tanstack/vue-hotkeys'

function ShiftIndicator() {
  const isShiftHeld = useKeyHold('Shift')

  return (
    <div style={{ opacity: isShiftHeld ? 1 : 0.5 }}>
      {isShiftHeld ? 'Shift is pressed!' : 'Press Shift'}
    </div>
  )
}`
</script>

<template>
  <HotkeysProvider>
    <div class="app">
      <header>
        <h1>useKeyHold</h1>
        <p>
          Returns a boolean indicating if a specific key is currently held.
          Optimized to only re-render when that specific key changes.
        </p>
      </header>

      <main>
        <section class="demo-section">
          <h2>Modifier Key States</h2>
          <div class="modifier-grid">
            <div class="modifier-indicator" :class="{ active: isShiftHeld }">
              <span class="key-name">Shift</span>
              <span class="status">{{
                isShiftHeld ? 'HELD' : 'Released'
              }}</span>
            </div>
            <div class="modifier-indicator" :class="{ active: isControlHeld }">
              <span class="key-name">Control</span>
              <span class="status">{{
                isControlHeld ? 'HELD' : 'Released'
              }}</span>
            </div>
            <div class="modifier-indicator" :class="{ active: isAltHeld }">
              <span class="key-name">Alt / Option</span>
              <span class="status">{{ isAltHeld ? 'HELD' : 'Released' }}</span>
            </div>
            <div class="modifier-indicator" :class="{ active: isMetaHeld }">
              <span class="key-name">Meta (⌘ / ⊞)</span>
              <span class="status">{{ isMetaHeld ? 'HELD' : 'Released' }}</span>
            </div>
          </div>
        </section>

        <section class="demo-section">
          <h2>Space Bar Demo</h2>
          <div class="space-indicator" :class="{ active: isSpaceHeld }">
            {{ isSpaceHeld ? '🚀 SPACE HELD!' : 'Hold Space Bar' }}
          </div>
        </section>

        <section class="demo-section">
          <h2>Usage</h2>
          <pre class="code-block">{{ usageCode }}</pre>
        </section>

        <section class="demo-section">
          <h2>Conditional UI Example</h2>
          <p>Hold <kbd>Shift</kbd> to reveal the secret message:</p>
          <div class="secret-box" :class="{ revealed: isShiftHeld }">
            {{
              isShiftHeld
                ? '🎉 The secret password is: tanstack-hotkeys-rocks!'
                : '••••••••••••••••••••••••••'
            }}
          </div>
        </section>

        <section class="demo-section">
          <h2>Use Cases</h2>
          <ul>
            <li>Show different UI based on modifier state</li>
            <li>Enable "power user" mode while holding a key</li>
            <li>Hold-to-reveal sensitive information</li>
            <li>Drag-and-drop with modifier behaviors</li>
            <li>Show additional options on hover + modifier</li>
          </ul>
        </section>
      </main>

      <TanStackDevtools :plugins="plugins" />
    </div>
  </HotkeysProvider>
</template>
