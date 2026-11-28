<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { HotkeysProvider, useKeyLockState } from '@tanstack/vue-hotkeys'
import { HotkeysDevtoolsPanel } from '@tanstack/vue-hotkeys-devtools'

const capsLock = useKeyLockState('CapsLock')
const numLock = useKeyLockState('NumLock')
const scrollLock = useKeyLockState('ScrollLock')
const plugins = [{ name: 'TanStack Hotkeys', component: HotkeysDevtoolsPanel }]

const locks = [
  { name: 'Caps Lock', state: capsLock },
  { name: 'Num Lock', state: numLock },
  { name: 'Scroll Lock', state: scrollLock },
]

function describe(state: boolean | null) {
  if (state === null) return 'Unknown'
  return state ? 'On' : 'Off'
}
</script>

<template>
  <HotkeysProvider>
    <div class="app">
      <h1>useKeyLockState</h1>

      <div class="field">
        <label for="password">Password</label>
        <input id="password" type="password" />
        <p role="status" class="warning">
          {{ capsLock === true ? 'Caps Lock is on' : '' }}
        </p>
      </div>

      <div class="locks">
        <div
          v-for="lock in locks"
          :key="lock.name"
          :class="['lock', { on: lock.state.value === true }]"
        >
          <span class="lock-name">{{ lock.name }}</span>
          <span>{{ describe(lock.state.value) }}</span>
        </div>
      </div>

      <p class="note">
        Unknown until you press a key, click, or move the mouse. Num Lock and
        Scroll Lock stay unknown on macOS.
      </p>

      <TanStackDevtools :plugins="plugins" />
    </div>
  </HotkeysProvider>
</template>
