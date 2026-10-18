<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'
import { useActivity } from './activity'
import Key from './Key.vue'

// Nested in the exclusive scope, so it stays active without being allowed.
const { log } = useActivity()
const step = ref(1)
useHotkey('Alt+[KeyN]', () => {
  step.value = (step.value % 3) + 1
  log('dialog-steps', 'Next step')
})
</script>

<template>
  <div class="panel">
    Step {{ step }} of 3. <Key hotkey="Alt+N" /> moves to the next step. It is
    in the nested <code>dialog-steps</code> scope, so it still works, and it
    takes the key from the suspended folders.
  </div>
</template>
