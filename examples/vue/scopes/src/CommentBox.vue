<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'
import { useActivity } from './activity'

const { log } = useActivity()
const comments = ref(0)
useHotkey('Mod+S', () => {
  comments.value++
  log('comments', 'Comment posted')
})
</script>

<template>
  <div class="panel">
    <strong>Comments</strong>
    <p>{{ comments }} posted</p>
  </div>
</template>
