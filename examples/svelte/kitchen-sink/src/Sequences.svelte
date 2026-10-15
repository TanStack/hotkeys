<script lang="ts">
  import { getContext } from 'svelte'
  import {
    formatForDisplay,
    createHotkey,
    createHotkeys,
    getHotkeyRegistrations,
  } from '@tanstack/svelte-hotkeys'
  const log = getContext<(message: string) => void>('log')
  let timeout = $state(1000)
  // An array of chords registers a sequence.
  createHotkey(
    ['[KeyG]', '[KeyG]'],
    () => log('Go to top'),
    () => ({
      timeout: timeout,
      meta: { name: 'Go to top', group: 'Sequences' },
    }),
  )
  createHotkeys(
    [
      {
        hotkey: ['[KeyG]', '[KeyI]'],
        callback: () => log('Inbox'),
        options: { meta: { name: 'Inbox', group: 'Sequences' } },
      },
      {
        hotkey: ['Shift+[KeyR]', 'Shift+[KeyT]'],
        callback: () => log('Shift chain'),
        options: { meta: { name: 'Shift chain', group: 'Sequences' } },
      },
    ],
    () => ({ timeout: timeout }),
  )
  const registry = getHotkeyRegistrations()
  const sequences = $derived(
    registry.hotkeys.filter((reg) => reg.kind === 'sequence'),
  )
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
      >{#each sequences as reg (reg.id)}<tr
          ><td>{reg.options.meta?.name}</td><td
            >{formatForDisplay(reg.hotkey, { sequenceSeparator: ' → ' })}</td
          ><td
            >{reg.matchedStepCount}/{reg.hotkey.length} steps; {reg.triggerCount}
            fired</td
          ></tr
        >{/each}</tbody
    >
  </table>
</section>
