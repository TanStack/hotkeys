<script lang="ts">
  import { getContext } from 'svelte'
  import {
    formatForDisplay,
    createHotkeySequence,
    createHotkeySequences,
    getHotkeyRegistrations,
  } from '@tanstack/svelte-hotkeys'
  const log = getContext<(message: string) => void>('log')
  let timeout = $state(1000)
  createHotkeySequence(
    ['[KeyG]', '[KeyG]'],
    () => log('Go to top'),
    () => ({
      timeout: timeout,
      meta: { name: 'Go to top', group: 'Sequences' },
    }),
  )
  createHotkeySequences(
    [
      {
        sequence: ['[KeyG]', '[KeyI]'],
        callback: () => log('Inbox'),
        options: { meta: { name: 'Inbox', group: 'Sequences' } },
      },
      {
        sequence: ['Shift+[KeyR]', 'Shift+[KeyT]'],
        callback: () => log('Shift chain'),
        options: { meta: { name: 'Shift chain', group: 'Sequences' } },
      },
    ],
    () => ({ timeout: timeout }),
  )
  const registry = getHotkeyRegistrations()
</script>

<section>
  <h2>Sequences</h2>
  <p>
    Physical G then G, G then I, or Shift + R then Shift + T. Repeats do not
    advance steps.
  </p>
  <label
    >Timeout: {timeout} ms
    <input
      type="range"
      min="300"
      max="2500"
      step="100"
      bind:value={timeout}
    /></label
  >
  <table>
    <tbody
      >{#each registry.sequences as reg (reg.id)}<tr
          ><td>{reg.options.meta?.name}</td><td
            >{reg.sequence.map((h) => formatForDisplay(h)).join(' → ')}</td
          ><td
            >{reg.matchedStepCount}/{reg.sequence.length} steps; {reg.triggerCount}
            fired</td
          ></tr
        >{/each}</tbody
    >
  </table>
</section>
