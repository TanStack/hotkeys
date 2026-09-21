<script setup lang="ts">
import { inject, ref } from 'vue'
import { formatForDisplay, useHotkeys } from '@tanstack/vue-hotkeys'

const props = defineProps<{ name: string }>()
const log = inject<(message: string) => void>('log')!
const target = ref<HTMLElement | null>(null),
  text = ref('One shortcut, two independent editors.'),
  saves = ref(0)
useHotkeys(
  [
    {
      hotkey: 'Mod+[KeyS]',
      callback: () => {
        saves.value++
        log(`${props.name} saved`)
      },
      options: { meta: { name: `Save ${props.name}`, group: 'Editor' } },
    },
    {
      hotkey: 'Alt+[Backspace]',
      callback: () => {
        text.value = ''
      },
      options: { meta: { name: `Clear ${props.name}`, group: 'Editor' } },
    },
  ],
  { target, ignoreInputs: false },
)
</script>
<template>
  <fieldset ref="target">
    <legend>{{ name }} — {{ saves }} saves</legend>
    <label>Editor content<textarea v-model="text" rows="3" /></label>
    <p>
      <kbd>{{ formatForDisplay('Mod+[KeyS]') }}</kbd> Save;
      <kbd>{{ formatForDisplay('Alt+[Backspace]') }}</kbd> Clear
    </p>
  </fieldset>
</template>
