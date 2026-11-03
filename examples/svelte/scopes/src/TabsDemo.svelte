<script lang="ts">
  import { HotkeysProvider, createHotkey } from '@tanstack/svelte-hotkeys'
  import FolderPane from './FolderPane.svelte'
  import Key from './Key.svelte'
  import ScopeFrame from './ScopeFrame.svelte'

  // `enabled` turns a scope off without unmounting it.
  const folders = ['Inbox', 'Archive', 'Spam'] as const
  let current = $state<(typeof folders)[number]>('Inbox')
  createHotkey('Alt+[Digit1]', () => (current = 'Inbox'))
  createHotkey('Alt+[Digit2]', () => (current = 'Archive'))
  createHotkey('Alt+[Digit3]', () => (current = 'Spam'))
</script>

<section class="demo-section">
  <h2>Enabled scopes</h2>
  <p>
    All three folders stay mounted and register <Key hotkey="Alt+N" />. Only the
    selected folder's provider is <code>enabled</code>, so the key adds to that
    one. Switch with <Key hotkey="Alt+1" />, <Key hotkey="Alt+2" />, and
    <Key hotkey="Alt+3" />.
  </p>
  <div class="folders">
    {#each folders as name (name)}
      <HotkeysProvider scope={name.toLowerCase()} enabled={current === name}>
        <ScopeFrame scope={name.toLowerCase()} enabled={current === name}>
          <FolderPane
            {name}
            current={current === name}
            onSelect={() => (current = name)}
          />
        </ScopeFrame>
      </HotkeysProvider>
    {/each}
  </div>
</section>
