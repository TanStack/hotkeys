<script setup lang="ts">
import { inject, ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'
import Hint from './Hint.vue'

const log = inject<(message: string) => void>('log')!
const count = ref(0),
  enabled = ref(true)
const create = () => {
  count.value++
  log('Ticket created')
}
const save = () => log('Ticket saved')
useHotkey('Alt+[KeyC]', create, () => ({
  enabled: enabled.value,
  ignoreInputs: false,
  meta: { name: 'Create ticket', group: 'Tickets' },
}))
useHotkey('Alt+[KeyS]', save, () => ({
  enabled: enabled.value,
  meta: { name: 'Save ticket', group: 'Tickets' },
}))
</script>
<template>
  <section>
    <h2>Tickets</h2>
    <p>Created: {{ count }}. Buttons and shortcuts share handlers.</p>
    <label
      ><input type="checkbox" v-model="enabled" /> Enable ticket actions</label
    >
    <button :disabled="!enabled" @click="create">
      Create ticket <Hint hotkey="Alt+[KeyC]" :enabled="enabled" />
    </button>
    <button :disabled="!enabled" @click="save">
      Save pending <Hint hotkey="Alt+[KeyS]" :enabled="enabled" />
    </button>
    <label>Ticket note <input placeholder="Try Alt + C while typing" /></label>
    <p>
      Create uses ignoreInputs: false. Save uses default filtering. The provider
      requires release before firing again.
    </p>
  </section>
</template>
