<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'
import { useActivity } from './activity'
import CommentBox from './CommentBox.vue'
import Key from './Key.vue'
import Scope from './Scope.vue'

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
    <Scope v-if="showComments" scope="comments"><CommentBox /></Scope>
  </section>
</template>
