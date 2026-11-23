<script setup lang="ts">
import { HotkeysProvider, useHotkey } from '@tanstack/vue-hotkeys'
import { ref } from 'vue'
import CommentBox from './CommentBox.vue'
import Key from './Key.vue'
import ScopeFrame from './ScopeFrame.vue'
import { useActivity } from './activity'

const { log } = useActivity()
const showComments = ref(true)
useHotkey('Mod+S', () => log('document', 'Document saved'))
</script>

<template>
  <section class="demo-section">
    <h2>Nested scopes</h2>
    <p>
      The document and its comment box both register <Key hotkey="Mod+S" />. The
      comment box is nested, so it wins while it is mounted. Hide it and the
      document handles the key again.
    </p>
    <label>
      <input v-model="showComments" type="checkbox" />
      Show comment box
    </label>
    <HotkeysProvider v-if="showComments" scope="comments">
      <ScopeFrame scope="comments">
        <CommentBox />
      </ScopeFrame>
    </HotkeysProvider>
  </section>
</template>
