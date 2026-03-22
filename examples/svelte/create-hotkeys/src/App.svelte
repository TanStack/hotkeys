<script lang="ts">
  import { createHotkeys, formatForDisplay } from '@tanstack/svelte-hotkeys'
  import type { Hotkey, CreateHotkeyDefinition } from '@tanstack/svelte-hotkeys'

  // Basic demo
  let log = $state<Array<string>>([])
  let saveCount = $state(0)
  let undoCount = $state(0)
  let redoCount = $state(0)

  createHotkeys([
    {
      hotkey: 'Shift+S',
      callback: (_e: KeyboardEvent, { hotkey }: { hotkey: string }) => {
        saveCount++
        log = [`${hotkey} pressed`, ...log].slice(0, 20)
      },
    },
    {
      hotkey: 'Shift+U',
      callback: (_e: KeyboardEvent, { hotkey }: { hotkey: string }) => {
        undoCount++
        log = [`${hotkey} pressed`, ...log].slice(0, 20)
      },
    },
    {
      hotkey: 'Shift+R',
      callback: (_e: KeyboardEvent, { hotkey }: { hotkey: string }) => {
        redoCount++
        log = [`${hotkey} pressed`, ...log].slice(0, 20)
      },
    },
  ])

  // Common options demo
  let commonEnabled = $state(true)
  let counts = $state({ a: 0, b: 0, c: 0 })

  createHotkeys(
    [
      {
        hotkey: 'Alt+J',
        callback: () => {
          counts = { ...counts, a: counts.a + 1 }
        },
      },
      {
        hotkey: 'Alt+K',
        callback: () => {
          counts = { ...counts, b: counts.b + 1 }
        },
      },
      {
        hotkey: 'Alt+L',
        callback: () => {
          counts = { ...counts, c: counts.c + 1 }
        },
        options: { enabled: true },
      },
    ],
    () => ({ enabled: commonEnabled }),
  )

  // Dynamic demo
  interface DynamicShortcut {
    id: number
    hotkey: string
    label: string
    count: number
  }

  let nextId = 0
  let shortcuts = $state<Array<DynamicShortcut>>([
    { id: nextId++, hotkey: 'Shift+A', label: 'Action A', count: 0 },
    { id: nextId++, hotkey: 'Shift+B', label: 'Action B', count: 0 },
    { id: nextId++, hotkey: 'Shift+C', label: 'Action C', count: 0 },
  ])

  let newHotkey = $state('')
  let newLabel = $state('')

  createHotkeys(() =>
    shortcuts.map(
      (s): CreateHotkeyDefinition => ({
        hotkey: s.hotkey as Hotkey,
        callback: () => {
          shortcuts = shortcuts.map((item) =>
            item.id === s.id ? { ...item, count: item.count + 1 } : item,
          )
        },
      }),
    ),
  )

  function addShortcut() {
    const trimmed = newHotkey.trim()
    if (!trimmed || !newLabel.trim()) return
    shortcuts = [
      ...shortcuts,
      { id: nextId++, hotkey: trimmed, label: newLabel.trim(), count: 0 },
    ]
    newHotkey = ''
    newLabel = ''
  }

  function removeShortcut(id: number) {
    shortcuts = shortcuts.filter((s) => s.id !== id)
  }

  function fd(h: string) {
    return formatForDisplay(h as Hotkey)
  }
</script>

<div class="app">
  <header>
    <h1>createHotkeys</h1>
    <p>
      Register multiple hotkeys in a single call. Supports dynamic arrays for
      variable-length shortcut lists.
    </p>
  </header>

  <!-- Basic Multi-Hotkey -->
  <div class="demo-section">
    <h2>Basic Multi-Hotkey Registration</h2>
    <p>
      All three hotkeys are registered in a single <code>createHotkeys()</code>
      call.
    </p>
    <div class="hotkey-grid">
      <div>
        <kbd>{fd('Shift+S')}</kbd> Save ({saveCount})
      </div>
      <div>
        <kbd>{fd('Shift+U')}</kbd> Undo ({undoCount})
      </div>
      <div>
        <kbd>{fd('Shift+R')}</kbd> Redo ({redoCount})
      </div>
    </div>
    {#if log.length > 0}
      <div class="log">
        {#each log as entry}
          <div class="log-entry">{entry}</div>
        {/each}
      </div>
    {/if}
    <pre class="code-block">createHotkeys([
  {'{'} hotkey: 'Shift+S', callback: () => save() {'}'},
  {'{'} hotkey: 'Shift+U', callback: () => undo() {'}'},
  {'{'} hotkey: 'Shift+R', callback: () => redo() {'}'},
])</pre>
  </div>

  <!-- Common Options -->
  <div class="demo-section">
    <h2>Common Options with Per-Hotkey Overrides</h2>
    <p>
      <kbd>{fd('Alt+J')}</kbd> and
      <kbd>{fd('Alt+K')}</kbd> respect the global toggle.
      <kbd>{fd('Alt+L')}</kbd> overrides
      <code>enabled: true</code> so it always works.
    </p>
    <div style="margin-bottom: 12px">
      <button onclick={() => (commonEnabled = !commonEnabled)}>
        {commonEnabled ? 'Disable' : 'Enable'} common hotkeys
      </button>
    </div>
    <div class="hotkey-grid">
      <div>
        <kbd>{fd('Alt+J')}</kbd> Action A ({counts.a})
      </div>
      <div>
        <kbd>{fd('Alt+K')}</kbd> Action B ({counts.b})
      </div>
      <div>
        <kbd>{fd('Alt+L')}</kbd> Action C ({counts.c})
        <span class="hint"> (always on)</span>
      </div>
    </div>
    <pre class="code-block">createHotkeys(
  [
    {'{'} hotkey: 'Alt+J', callback: () => actionA() {'}'},
    {'{'} hotkey: 'Alt+K', callback: () => actionB() {'}'},
    {'{'} hotkey: 'Alt+L', callback: () => actionC(),
      options: {'{'} enabled: true {'}'} {'}'}, // overrides common
  ],
  () => ({'{'} enabled {'}'}), // common option
)</pre>
  </div>

  <!-- Dynamic -->
  <div class="demo-section">
    <h2>Dynamic Hotkey List</h2>
    <p>
      Add or remove hotkeys at runtime. Because <code>createHotkeys</code>
      accepts a dynamic array, this works with Svelte's reactivity.
    </p>
    <div class="dynamic-list">
      {#each shortcuts as s (s.id)}
        <div class="dynamic-item">
          <kbd>{fd(s.hotkey)}</kbd>
          <span>{s.label}</span>
          <span class="count">{s.count}</span>
          <button onclick={() => removeShortcut(s.id)}>Remove</button>
        </div>
      {/each}
      {#if shortcuts.length === 0}
        <p class="hint">No shortcuts registered. Add one below.</p>
      {/if}
    </div>
    <div class="add-form">
      <input
        type="text"
        placeholder="Hotkey (e.g. Shift+D)"
        bind:value={newHotkey}
        onkeydown={(e) => {
          if (e.key === 'Enter') addShortcut()
        }}
      />
      <input
        type="text"
        placeholder="Label (e.g. Action D)"
        bind:value={newLabel}
        onkeydown={(e) => {
          if (e.key === 'Enter') addShortcut()
        }}
      />
      <button onclick={addShortcut} disabled={!newHotkey || !newLabel}>
        Add
      </button>
    </div>
    <pre class="code-block">let shortcuts = $state([...])

createHotkeys(
  () => shortcuts.map((s) => ({'{'}
    hotkey: s.key,
    callback: s.action,
  {'}'})),
)</pre>
  </div>
</div>
