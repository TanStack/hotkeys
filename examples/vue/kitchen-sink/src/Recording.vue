<script setup lang="ts">
import { inject, ref } from 'vue'
import {
  formatForDisplay,
  useHotkey,
  useHotkeyRecorder,
  useHotkeySequence,
  useHotkeySequenceRecorder,
} from '@tanstack/vue-hotkeys'
import type {
  Hotkey,
  HotkeySequence,
  RecorderKeyMode,
} from '@tanstack/vue-hotkeys'

const log = inject<(message: string) => void>('log')!
const initial: Hotkey = 'Alt+[KeyR]'
const hotkey = ref<Hotkey>(initial),
  sequence = ref<HotkeySequence>(['[KeyX]', '[KeyY]'])
const mode = ref<RecorderKeyMode>('code'),
  problem = ref(''),
  idle = ref(false),
  enter = ref(true)
useHotkey(hotkey, () => log('Recorded shortcut fired'), {
  meta: { name: 'Recorded action', group: 'Recording' },
})
useHotkeySequence(sequence, () => log('Recorded sequence fired'), {
  meta: { name: 'Recorded sequence', group: 'Recording' },
})
const recorder = useHotkeyRecorder(() => ({
  recordBy: mode.value,
  ignoreInputs: false,
  detectConflicts: {
    exclude: (reg) => reg.options.meta?.name === 'Recorded action',
  },
  validate: (_, { parsedHotkey }) =>
    parsedHotkey.modifiers.length > 0 || 'Include a modifier.',
  onRecord: (value) => {
    hotkey.value = value
    problem.value = ''
  },
  onClear: () => {
    hotkey.value = initial
  },
  onReject: (r) => {
    problem.value = r.message
  },
  onCancel: () => {
    problem.value = 'Cancelled'
  },
}))
const seq = useHotkeySequenceRecorder(() => ({
  recordBy: mode.value,
  ignoreInputs: false,
  idleTimeoutMs: idle.value ? 1500 : undefined,
  commitKeys: enter.value ? 'enter' : 'none',
  detectConflicts: {
    exclude: (reg) => reg.options.meta?.name === 'Recorded sequence',
  },
  validate: (steps) => steps.length >= 2 || 'Record at least two chords.',
  onRecord: (value) => {
    sequence.value = value
    problem.value = ''
  },
  onClear: () => {
    sequence.value = ['[KeyX]', '[KeyY]']
  },
  onReject: (r) => {
    problem.value = r.message
  },
  onCancel: () => {
    problem.value = 'Cancelled'
  },
}))
function resetShortcut() {
  recorder.stopRecording()
  hotkey.value = initial
}
</script>
<template>
  <section>
    <h2>Recording</h2>
    <p>Bindings live in ordinary route state. Try Alt + 1 for a conflict.</p>
    <label
      >Record by
      <select
        v-model="mode"
        :disabled="recorder.isRecording.value || seq.isRecording.value"
      >
        <option value="code">Physical code</option>
        <option value="key">Logical key</option>
      </select></label
    >
    <h3>Single shortcut</h3>
    <p>
      <kbd>{{ formatForDisplay(hotkey) }}</kbd> — <code>{{ hotkey }}</code>
    </p>
    <button
      :disabled="recorder.isRecording.value || seq.isRecording.value"
      @click="recorder.startRecording"
    >
      Record shortcut</button
    ><button @click="resetShortcut">Reset</button
    ><button
      v-if="recorder.isRecording.value"
      @click="recorder.cancelRecording"
    >
      Cancel
    </button>
    <h3>Sequence</h3>
    <p>
      {{
        (seq.isRecording.value ? seq.steps.value : sequence)
          .map((h) => formatForDisplay(h))
          .join(' → ')
      }}
    </p>
    <label
      ><input type="checkbox" v-model="idle" /> Commit after 1.5 seconds
      idle</label
    ><label><input type="checkbox" v-model="enter" /> Enter commits</label>
    <button
      :disabled="recorder.isRecording.value || seq.isRecording.value"
      @click="seq.startRecording"
    >
      Record sequence</button
    ><button
      :disabled="!seq.isRecording.value || !seq.steps.value.length"
      @click="seq.commitRecording"
    >
      Commit</button
    ><button v-if="seq.isRecording.value" @click="seq.cancelRecording">
      Cancel
    </button>
    <p>
      Backspace removes a sequence step or restores the initial binding when
      empty. Rejected steps remain editable.
    </p>
    <p role="status">{{ problem }}</p>
  </section>
</template>
