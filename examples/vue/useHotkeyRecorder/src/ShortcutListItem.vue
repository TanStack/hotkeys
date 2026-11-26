<script setup lang="ts">
import { useFormatForDisplay, useHeldKeys } from '@tanstack/vue-hotkeys'
import { computed } from 'vue'
import type { Hotkey } from '@tanstack/vue-hotkeys'
import type { Shortcut } from './types'

defineProps<{
  shortcut: Shortcut
  isEditing: boolean
  draftName: string
  draftDescription: string
}>()

defineEmits<{
  'update:draftName': [value: string]
  'update:draftDescription': [value: string]
  edit: []
  save: []
  cancel: []
  delete: []
}>()

const MODIFIER_ORDER = ['Control', 'Alt', 'Shift', 'Meta']

const formatForDisplay = useFormatForDisplay()
const heldKeys = useHeldKeys()
// Held modifiers in chord order, with platform labels: ⌃ ⌥ ⇧ ⌘ on macOS,
// Ctrl Alt Shift Win elsewhere. The next other key ends the recording.
const heldModifiers = computed(() =>
  heldKeys.value
    .filter((key) => MODIFIER_ORDER.includes(key))
    .sort((a, b) => MODIFIER_ORDER.indexOf(a) - MODIFIER_ORDER.indexOf(b)),
)
</script>

<template>
  <div class="shortcut-item" :class="{ recording: isEditing }">
    <div class="shortcut-item-content">
      <div class="shortcut-action">
        <template v-if="isEditing">
          <div class="editing-fields">
            <input
              type="text"
              class="edit-input edit-name"
              :value="draftName"
              placeholder="Shortcut name"
              @input="
                $emit(
                  'update:draftName',
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
            <input
              type="text"
              class="edit-input edit-description"
              :value="draftDescription"
              placeholder="Description (optional)"
              @input="
                $emit(
                  'update:draftDescription',
                  ($event.target as HTMLInputElement).value,
                )
              "
            />
          </div>
        </template>
        <template v-else>
          <template v-if="shortcut.name">{{ shortcut.name }}</template>
          <span v-else class="unnamed">Unnamed</span>
          <div v-if="shortcut.description" class="shortcut-description">
            {{ shortcut.description }}
          </div>
        </template>
      </div>
      <div class="shortcut-hotkey">
        <div v-if="isEditing" class="recording-indicator">
          <div v-if="heldModifiers.length > 0" class="held-hotkeys">
            <template v-for="(key, index) in heldModifiers" :key="key">
              <span v-if="index > 0" class="plus">+</span>
              <kbd>{{ formatForDisplay({ key }) }}</kbd>
            </template>
          </div>
          <span v-else class="recording-text"
            >Press any key combination...</span
          >
        </div>
        <kbd v-else-if="shortcut.hotkey">{{
          formatForDisplay(shortcut.hotkey as Hotkey)
        }}</kbd>
        <span v-else class="no-shortcut">No shortcut</span>
      </div>
    </div>
    <div class="shortcut-actions">
      <template v-if="isEditing">
        <button type="button" class="save-button" @click="$emit('save')">
          Save
        </button>
        <button type="button" class="cancel-button" @click="$emit('cancel')">
          Cancel
        </button>
      </template>
      <template v-else>
        <button type="button" class="edit-button" @click="$emit('edit')">
          Edit
        </button>
        <button type="button" class="delete-button" @click="$emit('delete')">
          Delete
        </button>
      </template>
    </div>
  </div>
</template>
