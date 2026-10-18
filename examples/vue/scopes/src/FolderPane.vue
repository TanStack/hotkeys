<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'
import { useActivity } from './activity'

const props = defineProps<{ name: string; current: boolean }>()
defineEmits<{ select: [] }>()
const { log } = useActivity()
const items = ref(0)
useHotkey('Alt+[KeyN]', () => {
  items.value++
  log(props.name.toLowerCase(), `Added to ${props.name}`)
})
</script>

<template>
  <button class="panel folder" :data-current="current" @click="$emit('select')">
    <strong>{{ name }}</strong>
    <span>{{ items }} items</span>
  </button>
</template>
