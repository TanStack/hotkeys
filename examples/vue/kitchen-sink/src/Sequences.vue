<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import {
  formatForDisplay,
  useHotkey,
  useHotkeyRegistrations,
  useHotkeys,
} from '@tanstack/vue-hotkeys'

const log = inject<(message: string) => void>('log')!
const timeout = ref(1000)
// An array of chords registers a sequence.
useHotkey(
  ['[KeyG]', '[KeyG]'],
  () => log('Go to top'),
  () => ({
    timeout: timeout.value,
    meta: { name: 'Go to top', group: 'Sequences' },
  }),
)
useHotkeys(
  [
    {
      hotkey: ['[KeyG]', '[KeyI]'],
      callback: () => log('Inbox'),
      options: { meta: { name: 'Inbox', group: 'Sequences' } },
    },
    {
      hotkey: ['Shift+[KeyR]', 'Shift+[KeyT]'],
      callback: () => log('Shift chain'),
      options: { meta: { name: 'Shift chain', group: 'Sequences' } },
    },
  ],
  () => ({ timeout: timeout.value }),
)
const registrations = useHotkeyRegistrations()
const sequences = computed(() =>
  registrations.value.filter((reg) => reg.kind === 'sequence'),
)
</script>
<template>
  <section>
    <h2>Sequences</h2>
    <p>
      Physical G then G, G then I, or Shift + R then Shift + T. Repeats do not
      advance steps.
    </p>
    <label
      >Timeout: {{ timeout }} ms
      <input
        type="range"
        min="300"
        max="2500"
        step="100"
        v-model.number="timeout"
    /></label>
    <table>
      <tbody>
        <tr v-for="reg in sequences" :key="reg.id">
          <td>{{ reg.options.meta?.name }}</td>
          <td>
            {{ formatForDisplay(reg.hotkey, { sequenceSeparator: ' → ' }) }}
          </td>
          <td>
            {{ reg.matchedStepCount }}/{{ reg.hotkey.length }} steps;
            {{ reg.triggerCount }} fired
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
