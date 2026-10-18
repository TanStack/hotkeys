<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'
import { useActivity } from './activity'
import Key from './Key.vue'

// In its own scope, so a dialog can allow just this hotkey.
const { log } = useActivity()
const opened = ref(0)
useHotkey('Mod+K', () => {
  opened.value++
  log('palette', 'Command palette opened')
})
</script>

<template>
  <section class="demo-section">
    <h2>Command palette</h2>
    <p>
      <Key hotkey="Mod+K" /> lives in its own <code>palette</code> scope, so an
      exclusive dialog can allow it without allowing everything else.
    </p>
    <div class="counter">
      Opened {{ opened }} {{ opened === 1 ? 'time' : 'times' }}
    </div>
  </section>
</template>
