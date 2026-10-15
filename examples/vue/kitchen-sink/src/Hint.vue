<script setup lang="ts">
import { formatForDisplay, useHotkeyHint } from '@tanstack/vue-hotkeys'
import type { Hotkey } from '@tanstack/vue-hotkeys'

const props = withDefaults(
  defineProps<{ hotkey: Hotkey; enabled?: boolean }>(),
  { enabled: true },
)
const visible = useHotkeyHint(() => props.hotkey)
</script>
<template>
  <kbd v-if="visible && enabled !== false">{{ formatForDisplay(hotkey) }}</kbd>
</template>
