<script lang="ts">
  import { onMount, setContext } from 'svelte'
  import {
    createHotkeys,
    createHotkey,
    formatForDisplay,
    getHeldKeys,
    getHeldKeyCodesMap,
    getIsKeyHeld,
    getHotkeyRegistrations,
  } from '@tanstack/svelte-hotkeys'
  import Tickets from './Tickets.svelte'
  import Editor from './Editor.svelte'
  import Sequences from './Sequences.svelte'
  import Recording from './Recording.svelte'
  import Formatting from './Formatting.svelte'
  import Hint from './Hint.svelte'
  const pages = [
    { path: '/', name: 'Tickets', component: Tickets, hotkey: 'Alt+[Digit1]' },
    {
      path: '/editor',
      name: 'Editor',
      component: Editor,
      hotkey: 'Alt+[Digit2]',
    },
    {
      path: '/sequences',
      name: 'Sequences',
      component: Sequences,
      hotkey: 'Alt+[Digit3]',
    },
    {
      path: '/recording',
      name: 'Recording',
      component: Recording,
      hotkey: 'Alt+[Digit4]',
    },
    {
      path: '/formatting',
      name: 'Formatting',
      component: Formatting,
      hotkey: 'Alt+[Digit5]',
    },
  ] as const
  let path = $state(location.hash.slice(1) || '/'),
    show = $state(false),
    activity = $state<Array<string>>([])
  onMount(() => {
    const update = () => {
      path = location.hash.slice(1) || '/'
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  })
  const page = $derived(pages.find((p) => p.path === path) ?? pages[0])
  setContext('log', (message: string) => {
    activity = [message, ...activity].slice(0, 6)
  })
  const keys = getHeldKeys(),
    codes = getHeldKeyCodesMap(),
    shift = getIsKeyHeld('Shift'),
    registry = getHotkeyRegistrations()
  createHotkeys(
    pages.map((p) => ({
      hotkey: p.hotkey,
      callback: () => {
        location.hash = p.path
      },
      options: { meta: { name: p.name, group: 'Navigation' } },
    })),
    { ignoreInputs: true },
  )
  createHotkey(
    'Alt+Shift+[KeyK]',
    () => {
      show = !show
    },
    { meta: { name: 'Show shortcuts', group: 'Navigation' } },
  )
</script>

<header>
  <h1>TanStack Hotkeys kitchen sink</h1>
  <p>
    Hold Alt / Option for hints. Route changes mount and unmount registrations.
  </p>
  <nav>
    {#each pages as p}<a href={`#${p.path}`} class:active={path === p.path}
        >{p.name} <Hint hotkey={p.hotkey} /></a
      >{/each}
  </nav>
  <button onclick={() => (show = !show)}
    >{show ? 'Hide' : 'Show'} shortcuts</button
  >
</header>
{#if show}<section>
    <h2>Live registry</h2>
    <table>
      <thead
        ><tr><th>Group / action</th><th>Binding</th><th>Status</th></tr></thead
      ><tbody>
        {#each [...registry.hotkeys, ...registry.sequences] as reg (reg.id)}<tr
            ><td>{reg.options.meta?.group} / {reg.options.meta?.name}</td><td
              >{('hotkey' in reg ? [reg.hotkey] : reg.sequence)
                .map((h) => formatForDisplay(h))
                .join(' → ')}</td
            ><td
              >{reg.options.enabled === false
                ? 'Disabled'
                : `${reg.triggerCount} fired`}</td
            ></tr
          >{/each}</tbody
      >
    </table>
  </section>{/if}
<main>
  {#key page.path}<page.component />{/key}
</main>
<section>
  <h2>Key state</h2>
  <p>
    Keys: {keys.keys.join(' + ') || 'None'}<br />Codes: {Object.values(
      codes.codes,
    ).join(' + ') || 'None'}<br />Shift: {shift.held ? 'held' : 'released'}
  </p>
  <h2>Activity</h2>
  <button onclick={() => (activity = [])}>Clear log</button>
  <ul aria-live="polite">
    {#each activity as message}<li>{message}</li>{/each}
  </ul>
</section>
