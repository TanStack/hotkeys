<script lang="ts">
  import {
    createHotkey,
    createHotkeyRecorder,
    formatForDisplay,
    isHotkeySequence,
  } from '@tanstack/svelte-hotkeys'
  import { getContext } from 'svelte'
  import type {
    Hotkey,
    RecorderKeyMode,
    RecorderRejection,
  } from '@tanstack/svelte-hotkeys'

  // The recorder sends a reason code, so the app writes the text
  const rejectionText = ({ reason, message }: RecorderRejection) =>
    message ??
    {
      'alt-graph': 'AltGr types characters. Record by key to use them.',
      'missing-code': 'This key has no physical key code.',
      whitespace: "Whitespace keys can't be recorded.",
      validation: 'This hotkey is not allowed.',
      conflict: 'This hotkey is already in use.',
    }[reason]
  const log = getContext<(message: string) => void>('log')
  const initial: Hotkey = 'Alt+[KeyR]'
  let hotkey = $state<Hotkey>(initial),
    sequence = $state<Hotkey>(['[KeyX]', '[KeyY]'])
  let mode = $state<RecorderKeyMode>('auto'),
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
    validate: (_, { parsedChord }) =>
      parsedChord.modifiers.length > 0 || 'Include a modifier.',
    onRecord: (value) => {
      hotkey = value
      problem = ''
    },
    onClear: () => {
      hotkey = initial
    },
    onReject: (r) => {
      problem = rejectionText(r)
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
      problem = rejectionText(r)
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
      ><option value="auto">By name, or position where needed (default)</option
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
