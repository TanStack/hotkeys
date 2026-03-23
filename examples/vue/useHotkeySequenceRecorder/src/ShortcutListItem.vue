<script setup lang="ts">
import { formatForDisplay, useHeldKeys } from '@tanstack/vue-hotkeys'
import type { HotkeySequence } from '@tanstack/vue-hotkeys'

defineEmits<{
  edit: []
  cancel: []
}>()

defineProps<{
  actionName: string
  sequence: HotkeySequence
  disabled: boolean
  isRecording: boolean
  liveSteps: HotkeySequence
}>()

const heldKeys = useHeldKeys()

function formatSeq(seq: HotkeySequence): string {
  return seq.map((h) => formatForDisplay(h)).join(' ')
}
</script>

<template>
  <div class="shortcut-item" :class="{ recording: isRecording }">
    <div class="shortcut-item-content">
      <div class="shortcut-action">{{ actionName }}</div>
      <div class="shortcut-hotkey">
        <div v-if="isRecording" class="recording-indicator">
          <span v-if="liveSteps.length > 0" class="held-hotkeys">{{
            formatSeq(liveSteps)
          }}</span>
          <div v-else-if="heldKeys.length > 0" class="held-hotkeys">
            <template v-for="(key, index) in heldKeys" :key="key">
              <span v-if="index > 0" class="plus">+</span>
              <kbd>{{ key }}</kbd>
            </template>
          </div>
          <span v-else class="recording-text">Press chords, then Enter…</span>
        </div>
        <kbd v-else-if="!disabled">{{ formatSeq(sequence) }}</kbd>
        <span v-else class="no-shortcut">No shortcut</span>
      </div>
    </div>
    <div class="shortcut-actions">
      <button
        v-if="isRecording"
        type="button"
        class="cancel-button"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button v-else type="button" class="edit-button" @click="$emit('edit')">
        Edit
      </button>
    </div>
  </div>
</template>
