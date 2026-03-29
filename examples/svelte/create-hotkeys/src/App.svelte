<script lang="ts">
  import {
    createHotkeys,
    formatForDisplay,
    getHotkeyRegistrations,
  } from '@tanstack/svelte-hotkeys'
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
      options: {
        meta: { name: 'Save', description: 'Save the current document' },
      },
    },
    {
      hotkey: 'Shift+U',
      callback: (_e: KeyboardEvent, { hotkey }: { hotkey: string }) => {
        undoCount++
        log = [`${hotkey} pressed`, ...log].slice(0, 20)
      },
      options: {
        meta: { name: 'Undo', description: 'Undo the last action' },
      },
    },
    {
      hotkey: 'Shift+R',
      callback: (_e: KeyboardEvent, { hotkey }: { hotkey: string }) => {
        redoCount++
        log = [`${hotkey} pressed`, ...log].slice(0, 20)
      },
      options: {
        meta: { name: 'Redo', description: 'Redo the last undone action' },
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
        options: {
          meta: {
            name: 'Action A',
            description: 'First action (respects toggle)',
          },
        },
      },
      {
        hotkey: 'Alt+K',
        callback: () => {
          counts = { ...counts, b: counts.b + 1 }
        },
        options: {
          meta: {
            name: 'Action B',
            description: 'Second action (respects toggle)',
          },
        },
      },
      {
        hotkey: 'Alt+L',
        callback: () => {
          counts = { ...counts, c: counts.c + 1 }
        },
        options: {
          enabled: true,
          meta: {
            name: 'Action C',
            description: 'Always-on action (overrides toggle)',
          },
        },
      },
    ],
    () => ({ enabled: commonEnabled }),
  )

  // Dynamic demo
  interface DynamicShortcut {
    id: number
    hotkey: string
    label: string
    description: string
    count: number
  }

  let nextId = 0
  let shortcuts = $state<Array<DynamicShortcut>>([
    {
      id: nextId++,
      hotkey: 'Shift+A',
      label: 'Action A',
      description: 'First dynamic action',
      count: 0,
    },
    {
      id: nextId++,
      hotkey: 'Shift+B',
      label: 'Action B',
      description: 'Second dynamic action',
      count: 0,
    },
    {
      id: nextId++,
      hotkey: 'Shift+C',
      label: 'Action C',
      description: 'Third dynamic action',
      count: 0,
    },
  ])

  let newHotkey = $state('')
  let newLabel = $state('')
  let newDescription = $state('')

  createHotkeys(() =>
    shortcuts.map(
      (s): CreateHotkeyDefinition => ({
        hotkey: s.hotkey as Hotkey,
        callback: () => {
          shortcuts = shortcuts.map((item) =>
            item.id === s.id ? { ...item, count: item.count + 1 } : item,
          )
        },
        options: {
          meta: { name: s.label, description: s.description },
        },
      }),
    ),
  )

  function addShortcut() {
    const trimmed = newHotkey.trim()
    if (!trimmed || !newLabel.trim()) return
    shortcuts = [
      ...shortcuts,
      {
        id: nextId++,
        hotkey: trimmed,
        label: newLabel.trim(),
        description: newDescription.trim(),
        count: 0,
      },
    ]
    newHotkey = ''
    newLabel = ''
    newDescription = ''
  }

  function removeShortcut(id: number) {
    shortcuts = shortcuts.filter((s) => s.id !== id)
  }

  function fd(h: string) {
    return formatForDisplay(h as Hotkey)
  }

  // Registrations viewer
  const registrations = getHotkeyRegistrations()
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
      call with <code>meta</code> for name and description.
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
    <pre class="code-block">{`createHotkeys([
  {
    hotkey: 'Shift+S',
    callback: () => save(),
    options: { meta: { name: 'Save', description: 'Save the document' } },
  },
  {
    hotkey: 'Shift+U',
    callback: () => undo(),
    options: { meta: { name: 'Undo', description: 'Undo the last action' } },
  },
])`}</pre>
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
    <pre class="code-block">{`createHotkeys(
  [
    { hotkey: 'Alt+J', callback: () => actionA(),
      options: { meta: { name: 'Action A' } } },
    { hotkey: 'Alt+L', callback: () => actionC(),
      options: { enabled: true, meta: { name: 'Action C' } } },
  ],
  () => ({ enabled }), // common option
)`}</pre>
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
        placeholder="Name (e.g. Action D)"
        bind:value={newLabel}
        onkeydown={(e) => {
          if (e.key === 'Enter') addShortcut()
        }}
      />
      <input
        type="text"
        placeholder="Description (optional)"
        bind:value={newDescription}
        onkeydown={(e) => {
          if (e.key === 'Enter') addShortcut()
        }}
      />
      <button onclick={addShortcut} disabled={!newHotkey || !newLabel}>
        Add
      </button>
    </div>
    <pre class="code-block">{`let shortcuts = $state([...])

createHotkeys(
  () => shortcuts.map((s) => ({
    hotkey: s.key,
    callback: s.action,
    options: { meta: { name: s.name, description: s.description } },
  })),
)`}</pre>
  </div>

  <!-- Registrations Viewer -->
  <div class="demo-section">
    <h2>Live Registrations (getHotkeyRegistrations)</h2>
    <p>
      This table is rendered from
      <code>getHotkeyRegistrations()</code> — a reactive view of all registered hotkeys.
      It updates automatically as hotkeys are added, removed, enabled/disabled, or
      triggered.
    </p>
    <table class="registrations-table">
      <thead>
        <tr>
          <th>Hotkey</th>
          <th>Name</th>
          <th>Description</th>
          <th>Enabled</th>
          <th>Triggers</th>
        </tr>
      </thead>
      <tbody>
        {#each registrations.hotkeys as reg (reg.id)}
          <tr>
            <td>
              <kbd>{formatForDisplay(reg.hotkey)}</kbd>
            </td>
            <td>{reg.options.meta?.name ?? '—'}</td>
            <td class="description-cell">
              {reg.options.meta?.description ?? '—'}
            </td>
            <td>
              <span
                class={reg.options.enabled !== false
                  ? 'status-on'
                  : 'status-off'}
              >
                {reg.options.enabled !== false ? 'yes' : 'no'}
              </span>
            </td>
            <td class="trigger-count">{reg.triggerCount}</td>
          </tr>
        {/each}
        {#if registrations.hotkeys.length === 0}
          <tr>
            <td colspan="5" class="hint">No hotkeys registered</td>
          </tr>
        {/if}
      </tbody>
    </table>
    {#if registrations.sequences.length > 0}
      <h3 style="margin-top: 16px">Sequences</h3>
      <table class="registrations-table">
        <thead>
          <tr>
            <th>Sequence</th>
            <th>Name</th>
            <th>Description</th>
            <th>Triggers</th>
          </tr>
        </thead>
        <tbody>
          {#each registrations.sequences as reg (reg.id)}
            <tr>
              <td>
                {#each reg.sequence as s, i}
                  {#if i > 0}{' '}{/if}<kbd>{formatForDisplay(s)}</kbd>
                {/each}
              </td>
              <td>{reg.options.meta?.name ?? '—'}</td>
              <td class="description-cell">
                {reg.options.meta?.description ?? '—'}
              </td>
              <td class="trigger-count">{reg.triggerCount}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
    <pre class="code-block">{`const registrations = getHotkeyRegistrations()

// Render a live table of all registrations
// registrations.hotkeys → reactive array
// registrations.hotkeys[0].options.meta?.name
// registrations.hotkeys[0].triggerCount`}</pre>
  </div>
</div>
