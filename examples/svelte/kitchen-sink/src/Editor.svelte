<script lang="ts">
  import { getContext } from 'svelte'
  import {
    formatForDisplay,
    createHotkeyAttachment,
    createHotkey,
  } from '@tanstack/svelte-hotkeys'
  import EditorPane from './EditorPane.svelte'
  const log = getContext<(message: string) => void>('log')
  let repeat = $state(false),
    count = $state(0),
    bubble = $state(false),
    scope = $state<HTMLElement | null>(null)
  createHotkey(
    'Alt+[ArrowRight]',
    () => count++,
    () => ({
      requireReset: !repeat,
      meta: { name: 'Counter', group: 'Editor' },
    }),
  )
  const scoped = createHotkeyAttachment(
    'Alt+[KeyB]',
    () => log('Scoped B'),
    () => ({
      stopPropagation: !bubble,
      preventDefault: !bubble,
      meta: { name: 'Scoped propagation', group: 'Editor' },
    }),
  )
  createHotkey('Alt+[KeyB]', () => log('Document B'), {
    meta: { name: 'Document propagation', group: 'Editor' },
  })
  createHotkey('Alt+[KeyU]', () => log('Keyup U'), {
    eventType: 'keyup',
    meta: { name: 'Keyup', group: 'Editor' },
  })
</script>

<section>
  <h2>Editor scopes</h2>
  <p>Focus an editor to choose its Save handler.</p>
  <EditorPane name="Draft" /><EditorPane name="Notes" />
  <label><input type="checkbox" bind:checked={repeat} /> Allow repeat</label>
  <p>
    Hold <kbd>{formatForDisplay('Alt+[ArrowRight]')}</kbd>: {count}. Release Alt
    + U for a keyup event.
  </p>
  <fieldset bind:this={scope} {@attach scoped} tabindex="-1">
    <legend>Propagation</legend><label
      ><input type="checkbox" bind:checked={bubble} /> Allow bubbling and browser
      defaults</label
    >
    <p>Focus here and press Alt + B; watch Activity.</p>
    <button onclick={() => scope?.focus()}>Focus this area</button>
  </fieldset>
</section>
