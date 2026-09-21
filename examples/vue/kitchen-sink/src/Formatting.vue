<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatForDisplay } from '@tanstack/vue-hotkeys'

const platform = ref<'mac' | 'windows' | 'linux'>('mac'),
  modifiers = ref(false),
  keys = ref(true)
const options = computed(() => ({
  platform: platform.value,
  useSymbols: { modifiers: modifiers.value, keys: keys.value },
}))
const bindings = [
  'Mod+Shift+ArrowUp',
  'Control++',
  'Alt+[KeyS]',
  'Mod+[NumpadAdd]',
] as const
</script>
<template>
  <section>
    <h2>Formatting</h2>
    <label
      >Platform
      <select v-model="platform">
        <option value="mac">macOS</option>
        <option value="windows">Windows</option>
        <option value="linux">Linux</option>
      </select></label
    ><label
      ><input type="checkbox" v-model="modifiers" /> Modifier symbols</label
    ><label><input type="checkbox" v-model="keys" /> Key symbols</label>
    <table>
      <thead>
        <tr>
          <th>Binding</th>
          <th>String</th>
          <th>Parts</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="binding in bindings" :key="binding">
          <td>
            <code>{{ binding }}</code>
          </td>
          <td>{{ formatForDisplay(binding, options) }}</td>
          <td>
            <kbd
              v-for="(part, i) in formatForDisplay(binding, {
                ...options,
                parts: true,
              })"
              :key="i"
              >{{ part }}</kbd
            >
          </td>
        </tr>
      </tbody>
    </table>
    <p>
      Supply layoutMap or keyLabels for layout labels. Formatting never changes
      binding identity.
    </p>
  </section>
</template>
