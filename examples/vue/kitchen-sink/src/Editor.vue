<script setup lang="ts">
import { inject, ref } from 'vue'
import { formatForDisplay, useHotkey } from '@tanstack/vue-hotkeys'
import EditorPane from './EditorPane.vue'

const log = inject<(message: string) => void>('log')!
const repeat = ref(false),
  count = ref(0),
  bubble = ref(false),
  scope = ref<HTMLElement | null>(null)
useHotkey(
  'Alt+[ArrowRight]',
  () => count.value++,
  () => ({
    requireReset: !repeat.value,
    meta: { name: 'Counter', group: 'Editor' },
  }),
)
useHotkey(
  'Alt+[KeyB]',
  () => log('Scoped B'),
  () => ({
    target: scope,
    stopPropagation: !bubble.value,
    preventDefault: !bubble.value,
    meta: { name: 'Scoped propagation', group: 'Editor' },
  }),
)
useHotkey('Alt+[KeyB]', () => log('Document B'), {
  meta: { name: 'Document propagation', group: 'Editor' },
})
useHotkey('Alt+[KeyU]', () => log('Keyup U'), {
  eventType: 'keyup',
  meta: { name: 'Keyup', group: 'Editor' },
})
</script>
<template>
  <section>
    <h2>Editor scopes</h2>
    <p>Focus an editor to choose which Save handler receives the shortcut.</p>
    <EditorPane name="Draft" /><EditorPane name="Notes" />
    <label><input type="checkbox" v-model="repeat" /> Allow repeat</label>
    <p>
      Hold <kbd>{{ formatForDisplay('Alt+[ArrowRight]') }}</kbd
      >: {{ count }}. Release Alt + U for a keyup event.
    </p>
    <fieldset ref="scope" tabindex="0">
      <legend>Propagation</legend>
      <label
        ><input type="checkbox" v-model="bubble" /> Allow bubbling and browser
        defaults</label
      >
      <p>Focus here and press Alt + B; watch Activity.</p>
      <button @click="scope?.focus()">Focus this area</button>
    </fieldset>
  </section>
</template>
