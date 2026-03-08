<script setup lang="ts">
import { formatForDisplay, useHeldKeys } from '@tanstack/vue-hotkeys'
import type { Hotkey } from '@tanstack/vue-hotkeys'

defineEmits<{
  edit: []
  cancel: []
}>()

defineProps<{
  actionName: string
  hotkey: string
  isRecording: boolean
}>()

const heldKeys = useHeldKeys()
</script>

<template>
  <div class="shortcut-item" :class="{ recording: isRecording }">
    <div class="shortcut-item-content">
      <div class="shortcut-action">{{ actionName }}</div>
      <div class="shortcut-hotkey">
        <div v-if="isRecording" class="recording-indicator">
          <div v-if="heldKeys.length > 0" class="held-hotkeys">
            <template v-for="(key, index) in heldKeys" :key="key">
              <span v-if="index > 0" class="plus">+</span>
              <kbd>{{ key }}</kbd>
            </template>
          </div>
          <span v-else class="recording-text"
            >Press any key combination...</span
          >
        </div>
        <kbd v-else-if="hotkey">{{ formatForDisplay(hotkey as Hotkey) }}</kbd>
        <span v-else class="no-shortcut">No shortcut</span>
      </div>
    </div>
    <div class="shortcut-actions">
      <button v-if="isRecording" class="cancel-button" @click="$emit('cancel')">
        Cancel
      </button>
      <button v-else class="edit-button" @click="$emit('edit')">Edit</button>
    </div>
  </div>
</template>
