<script lang="ts">
  import { getContext } from 'svelte'
  import {
    formatForDisplay,
    createHotkey,
    createHotkeyRecorder,
    isHotkeySequence,
  } from '@tanstack/svelte-hotkeys'
  import type { Hotkey, RecorderKeyMode } from '@tanstack/svelte-hotkeys'
  const log = getContext<(message: string) => void>('log')
  const initial: Hotkey = 'Alt+[KeyR]'
  let hotkey = $state<Hotkey>(initial),
    sequence = $state<Hotkey>(['[KeyX]', '[KeyY]'])
  let mode = $state<RecorderKeyMode>('code'),
    problem = $state(''),
    idle = $state(false),
    enter = $state(true)
  createHotkey(
    () => hotkey,
    () => log('Recorded shortcut fired'),
    { meta: { name: 'Recorded action', group: 'Recording' } },
  )
  createHotkey(
    () => sequence,
    () => log('Recorded sequence fired'),
    { meta: { name: 'Recorded sequence', group: 'Recording' } },
  )
  const recorder = createHotkeyRecorder(() => ({
    recordBy: mode,
    ignoreInputs: false,
    detectConflicts: {
      exclude: (reg) => reg.options.meta?.name === 'Recorded action',
    },
    validate: (_, { parsedHotkey }) =>
      parsedHotkey.modifiers.length > 0 || 'Include a modifier.',
    onRecord: (value) => {
      hotkey = value
      problem = ''
    },
    onClear: () => {
      hotkey = initial
    },
    onReject: (r) => {
      problem = r.message
    },
    onCancel: () => {
      problem = 'Cancelled'
    },
  }))
  // maxSteps above 1 records sequences; one step records a chord.
  const seq = createHotkeyRecorder(() => ({
    maxSteps: Infinity,
    recordBy: mode,
    ignoreInputs: false,
    idleTimeoutMs: idle ? 1500 : undefined,
    commitKeys: enter ? 'enter' : 'none',
    detectConflicts: {
      exclude: (reg) => reg.options.meta?.name === 'Recorded sequence',
    },
    validate: (value) =>
      (isHotkeySequence(value) && value.length >= 2) ||
      'Record at least two chords.',
    onRecord: (value) => {
      sequence = value
      problem = ''
    },
    onClear: () => {
      sequence = ['[KeyX]', '[KeyY]']
    },
    onReject: (r) => {
      problem = r.message
    },
    onCancel: () => {
      problem = 'Cancelled'
    },
  }))
</script>

<section>
  <h2>Recording</h2>
  <p>Bindings live in route state. Try Alt + 1 for a conflict.</p>
  <label
    >Record by <select
      bind:value={mode}
      disabled={recorder.isRecording || seq.isRecording}
      ><option value="code">Physical code</option><option value="key"
        >Logical key</option
      ></select
    ></label
  >
  <h3>Single shortcut</h3>
  <p><kbd>{formatForDisplay(hotkey)}</kbd> — <code>{hotkey}</code></p>
  <button
    disabled={recorder.isRecording || seq.isRecording}
    onclick={recorder.startRecording}>Record shortcut</button
  ><button
    onclick={() => {
      recorder.stopRecording()
      hotkey = initial
    }}>Reset</button
  >{#if recorder.isRecording}<button onclick={recorder.cancelRecording}
      >Cancel</button
    >{/if}
  <h3>Sequence</h3>
  <p>
    {formatForDisplay(seq.isRecording ? seq.steps : sequence, {
      sequenceSeparator: ' → ',
    })}
  </p>
  <label
    ><input type="checkbox" bind:checked={idle} /> Commit after 1.5 seconds idle</label
  ><label><input type="checkbox" bind:checked={enter} /> Enter commits</label>
  <button
    disabled={recorder.isRecording || seq.isRecording}
    onclick={seq.startRecording}>Record sequence</button
  ><button
    disabled={!seq.isRecording || !seq.steps.length}
    onclick={seq.commitRecording}>Commit</button
  >{#if seq.isRecording}<button onclick={seq.cancelRecording}>Cancel</button
    >{/if}
  <p>
    Backspace removes a step or restores the initial binding when empty.
    Rejected steps remain editable.
  </p>
  <p role="status">{problem}</p>
</section>
