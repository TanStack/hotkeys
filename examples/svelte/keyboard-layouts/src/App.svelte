<script lang="ts">
  import { TanStackDevtools } from '@tanstack/svelte-devtools'
  import { createHotkeys, getFormatForDisplay } from '@tanstack/svelte-hotkeys'
  import { hotkeysDevtoolsPlugin } from '@tanstack/svelte-hotkeys-devtools'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'

  interface Shortcut {
    hotkey: Hotkey
    name: string
  }

  // These type-check because German keys are registered in main.ts.
  const germanShortcuts: Array<Shortcut> = [
    { hotkey: 'Mod+Ö', name: 'Toggle comment' },
    { hotkey: 'Mod+Shift+Ä', name: 'Add annotation' },
    { hotkey: 'ß', name: 'Toggle sidebar' },
    { hotkey: '§', name: 'Show sections' },
  ]

  // A to Z, 0 to 9, named keys, and physical codes type-check under every
  // registration, and fire on every layout.
  const everyLayoutShortcuts: Array<Shortcut> = [
    { hotkey: 'Mod+K', name: 'Open command palette' },
    { hotkey: 'Alt+[Digit1]', name: 'Go to the first tab' },
    { hotkey: 'Escape', name: 'Clear' },
  ]

  const formatForDisplay = getFormatForDisplay()

  let counts = $state<Record<string, number>>({})
  let lastFired = $state<Hotkey | null>(null)

  createHotkeys(
    [...germanShortcuts, ...everyLayoutShortcuts].map((shortcut) => ({
      hotkey: shortcut.hotkey,
      callback: () => {
        counts[shortcut.name] = (counts[shortcut.name] ?? 0) + 1
        lastFired = shortcut.hotkey
      },
    })),
  )

  const devtoolsPlugins = [hotkeysDevtoolsPlugin()]
</script>

{#snippet rows(shortcuts: Array<Shortcut>)}
  <div class="hotkey-list">
    {#each shortcuts as shortcut (shortcut.name)}
      <div class="hotkey-row" class:fired={lastFired === shortcut.hotkey}>
        <span>
          <kbd>{formatForDisplay(shortcut.hotkey)}</kbd>
          {shortcut.name}
        </span>
        <span class="count">{counts[shortcut.name] ?? 0}×</span>
      </div>
    {/each}
  </div>
{/snippet}

<div class="app">
  <header>
    <h1>Keyboard Layouts</h1>
    <p>
      Registering a layout lets hotkey strings accept the keys it types, such as
      Ö and ß. It changes types only: these hotkeys match the same way without
      it.
    </p>
  </header>

  <main>
    <section class="demo-section">
      <h2>German keys</h2>
      <p class="note">Switch your keyboard layout to German to press these.</p>
      {@render rows(germanShortcuts)}
    </section>

    <section class="demo-section">
      <h2>Keys on every layout</h2>
      {@render rows(everyLayoutShortcuts)}
    </section>

    <section class="demo-section">
      <h2>Usage</h2>
      <pre
        class="code-block">{`import type { GermanKeys, UsKeys } from '@tanstack/svelte-hotkeys'

declare module '@tanstack/svelte-hotkeys' {
  interface Register {
    keys: UsKeys | GermanKeys
  }
}

createHotkey('Mod+Ö', toggleComment) // OK
createHotkey('Mod+[', outdent) // OK, because UsKeys is listed
createHotkey('Mod+Ñ', x) // Type error: Spanish isn't registered`}</pre>
    </section>
  </main>
</div>

{#if import.meta.env.DEV}
  <TanStackDevtools plugins={devtoolsPlugins} />
{/if}
