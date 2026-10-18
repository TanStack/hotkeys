<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'
import { useActivity } from './activity'
import Key from './Key.vue'

// Registered under the root provider, so it is in the `global` scope.
const { entries, clear } = useActivity()
useHotkey('Alt+[KeyL]', clear)
</script>

<template>
  <section class="demo-section">
    <h2>Activity</h2>
    <p>
      <Key hotkey="Alt+L" /> clears the log. It is registered under the root
      provider, so it is in the <code>global</code> scope.
    </p>
    <div class="log">
      <div v-if="entries.length === 0" class="hint">Press a hotkey above.</div>
      <div v-for="entry in entries" :key="entry.id" class="log-entry">
        <code class="log-scope">{{ entry.scope }}</code>
        {{ entry.message }}
      </div>
    </div>
  </section>
</template>
