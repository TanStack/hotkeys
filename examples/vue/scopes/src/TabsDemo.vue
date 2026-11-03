<script setup lang="ts">
import { ref } from 'vue'
import { HotkeysProvider, useHotkey } from '@tanstack/vue-hotkeys'
import FolderPane from './FolderPane.vue'
import Key from './Key.vue'
import ScopeFrame from './ScopeFrame.vue'

// `enabled` turns a scope off without unmounting it.
const folders = ['Inbox', 'Archive', 'Spam'] as const
const current = ref<(typeof folders)[number]>('Inbox')
useHotkey('Alt+[Digit1]', () => (current.value = 'Inbox'))
useHotkey('Alt+[Digit2]', () => (current.value = 'Archive'))
useHotkey('Alt+[Digit3]', () => (current.value = 'Spam'))
</script>

<template>
  <section class="demo-section">
    <h2>Enabled scopes</h2>
    <p>
      All three folders stay mounted and register <Key hotkey="Alt+N" />. Only
      the selected folder's provider is <code>enabled</code>, so the key adds to
      that one. Switch with <Key hotkey="Alt+1" />, <Key hotkey="Alt+2" />, and
      <Key hotkey="Alt+3" />.
    </p>
    <div class="folders">
      <HotkeysProvider
        v-for="name in folders"
        :key="name"
        :scope="name.toLowerCase()"
        :enabled="current === name"
      >
        <ScopeFrame :scope="name.toLowerCase()" :enabled="current === name">
          <FolderPane
            :name="name"
            :current="current === name"
            @select="current = name"
          />
        </ScopeFrame>
      </HotkeysProvider>
    </div>
  </section>
</template>
