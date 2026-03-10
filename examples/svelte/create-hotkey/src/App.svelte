<script lang="ts">
  import {
    createHotkey,
    createHotkeyAttachment,
    formatForDisplay,
  } from '@tanstack/svelte-hotkeys'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'

  let lastHotkey = $state<Hotkey | null>(null)
  let saveCount = $state(0)
  let incrementCount = $state(0)
  let enabled = $state(true)
  let activeTab = $state(1)
  let navigationCount = $state(0)
  let functionKeyCount = $state(0)
  let multiModifierCount = $state(0)
  let editingKeyCount = $state(0)

  let modalOpen = $state(false)
  let editorContent = $state('')
  let sidebarShortcutCount = $state(0)
  let modalShortcutCount = $state(0)
  let editorShortcutCount = $state(0)

  let modalRef = $state<HTMLDivElement | null>(null)

  $effect(() => {
    if (modalOpen && modalRef) {
      modalRef.focus()
    }
  })

  createHotkey('Mod+S', (_event, { hotkey }) => {
    lastHotkey = hotkey
    saveCount++
    console.log('Hotkey triggered:', hotkey)
  })

  createHotkey(
    'Mod+K',
    (_event, { hotkey }) => {
      lastHotkey = hotkey
      incrementCount++
    },
    { requireReset: true },
  )

  createHotkey(
    'Mod+E',
    () => {
      lastHotkey = 'Mod+E'
      alert('This hotkey can be toggled!')
    },
    () => ({ enabled }),
  )

  createHotkey('Mod+1', () => {
    lastHotkey = 'Mod+1'
    activeTab = 1
  })
  createHotkey('Mod+2', () => {
    lastHotkey = 'Mod+2'
    activeTab = 2
  })
  createHotkey('Mod+3', () => {
    lastHotkey = 'Mod+3'
    activeTab = 3
  })
  createHotkey('Mod+4', () => {
    lastHotkey = 'Mod+4'
    activeTab = 4
  })
  createHotkey('Mod+5', () => {
    lastHotkey = 'Mod+5'
    activeTab = 5
  })

  createHotkey('Shift+ArrowUp', () => {
    lastHotkey = 'Shift+ArrowUp'
    navigationCount++
  })
  createHotkey('Shift+ArrowDown', () => {
    lastHotkey = 'Shift+ArrowDown'
    navigationCount++
  })
  createHotkey('Alt+ArrowLeft', () => {
    lastHotkey = 'Alt+ArrowLeft'
    navigationCount++
  })
  createHotkey('Alt+ArrowRight', () => {
    lastHotkey = 'Alt+ArrowRight'
    navigationCount++
  })
  createHotkey('Mod+Home', () => {
    lastHotkey = 'Mod+Home'
    navigationCount++
  })
  createHotkey('Mod+End', () => {
    lastHotkey = 'Mod+End'
    navigationCount++
  })
  createHotkey('Control+PageUp', () => {
    lastHotkey = 'Control+PageUp'
    navigationCount++
  })
  createHotkey('Control+PageDown', () => {
    lastHotkey = 'Control+PageDown'
    navigationCount++
  })

  createHotkey('Meta+F4', () => {
    lastHotkey = 'Alt+F4'
    functionKeyCount++
    alert('Alt+F4 pressed (normally closes window)')
  })
  createHotkey('Control+F5', () => {
    lastHotkey = 'Control+F5'
    functionKeyCount++
  })
  createHotkey('Mod+F1', () => {
    lastHotkey = 'Mod+F1'
    functionKeyCount++
  })
  createHotkey('Shift+F10', () => {
    lastHotkey = 'Shift+F10'
    functionKeyCount++
  })

  createHotkey('Mod+Shift+S', () => {
    lastHotkey = 'Mod+Shift+S'
    multiModifierCount++
  })
  createHotkey('Mod+Shift+Z', () => {
    lastHotkey = 'Mod+Shift+Z'
    multiModifierCount++
  })
  createHotkey({ key: 'A', ctrl: true, alt: true }, () => {
    lastHotkey = 'Control+Alt+A'
    multiModifierCount++
  })
  createHotkey('Control+Shift+N', () => {
    lastHotkey = 'Control+Shift+N'
    multiModifierCount++
  })
  createHotkey('Mod+Alt+T', () => {
    lastHotkey = 'Mod+Alt+T'
    multiModifierCount++
  })
  createHotkey('Control+Alt+Shift+X', () => {
    lastHotkey = 'Control+Alt+Shift+X'
    multiModifierCount++
  })

  createHotkey('Mod+Enter', () => {
    lastHotkey = 'Mod+Enter'
    editingKeyCount++
  })
  createHotkey('Shift+Enter', () => {
    lastHotkey = 'Shift+Enter'
    editingKeyCount++
  })
  createHotkey('Mod+Backspace', () => {
    lastHotkey = 'Mod+Backspace'
    editingKeyCount++
  })
  createHotkey('Mod+Delete', () => {
    lastHotkey = 'Mod+Delete'
    editingKeyCount++
  })
  createHotkey('Control+Tab', () => {
    lastHotkey = 'Control+Tab'
    editingKeyCount++
  })
  createHotkey('Shift+Tab', () => {
    lastHotkey = 'Shift+Tab'
    editingKeyCount++
  })
  createHotkey('Mod+Space', () => {
    lastHotkey = 'Mod+Space'
    editingKeyCount++
  })

  createHotkey({ key: 'Escape' }, () => {
    lastHotkey = null
    saveCount = 0
    incrementCount = 0
    navigationCount = 0
    functionKeyCount = 0
    multiModifierCount = 0
    editingKeyCount = 0
    activeTab = 1
  })

  createHotkey('F12', () => {
    lastHotkey = 'F12'
    functionKeyCount++
  })

  const sidebarBoldHotkey = createHotkeyAttachment('Mod+B', () => {
    lastHotkey = 'Mod+B'
    sidebarShortcutCount++
    alert(
      'Sidebar shortcut triggered! This only works when the sidebar area is focused.',
    )
  })

  const sidebarNewItemHotkey = createHotkeyAttachment('Mod+N', () => {
    lastHotkey = 'Mod+N'
    sidebarShortcutCount++
  })

  const closeModalHotkey = createHotkeyAttachment(
    'Escape',
    () => {
      lastHotkey = 'Escape'
      modalShortcutCount++
      modalOpen = false
    },
    () => ({ enabled: modalOpen }),
  )

  const submitModalHotkey = createHotkeyAttachment(
    'Mod+Enter',
    () => {
      lastHotkey = 'Mod+Enter'
      modalShortcutCount++
      alert('Modal submit shortcut!')
    },
    () => ({ enabled: modalOpen }),
  )

  const saveEditorHotkey = createHotkeyAttachment('Mod+S', () => {
    lastHotkey = 'Mod+S'
    editorShortcutCount++
    alert(
      `Editor content saved: "${editorContent.substring(0, 50)}${editorContent.length > 50 ? '...' : ''}"`,
    )
  })

  const addEditorCommentHotkey = createHotkeyAttachment('Mod+/', () => {
    lastHotkey = 'Mod+/'
    editorShortcutCount++
    editorContent += '\n// Comment added via shortcut'
  })

  const clearEditorHotkey = createHotkeyAttachment('Mod+K', () => {
    lastHotkey = 'Mod+K'
    editorShortcutCount++
    editorContent = ''
  })
</script>

<div class="app">
  <header>
    <h1>createHotkey</h1>
    <p>
      Register keyboard shortcuts with callback context containing the hotkey
      and parsed hotkey information.
    </p>
  </header>

  <main>
    <section class="demo-section">
      <h2>Basic Hotkey</h2>
      <p>
        Press <kbd>{formatForDisplay('Mod+S')}</kbd> to trigger
      </p>
      <div class="counter">Save triggered: {saveCount}x</div>
      <pre
        class="code-block">{`createHotkey('Mod+S', (_event, { hotkey, parsedHotkey }) => {
  console.log('Hotkey:', hotkey)
  console.log('Parsed:', parsedHotkey)
})`}</pre>
    </section>

    <section class="demo-section">
      <h2>With requireReset</h2>
      <p>
        Hold <kbd>{formatForDisplay('Mod+K')}</kbd> — only increments once until you
        release all keys
      </p>
      <div class="counter">Increment: {incrementCount}</div>
      <p class="hint">
        This prevents repeated triggering while holding the keys down. Release
        all keys to allow re-triggering.
      </p>
      <pre class="code-block">{`createHotkey(
  'Mod+K',
  (event, { hotkey }) => {
    count++
  },
  { requireReset: true }
)`}</pre>
    </section>

    <section class="demo-section">
      <h2>Conditional Hotkey</h2>
      <p>
        <kbd>{formatForDisplay('Mod+E')}</kbd> is currently
        <strong>{enabled ? 'enabled' : 'disabled'}</strong>
      </p>
      <button onclick={() => (enabled = !enabled)}>
        {enabled ? 'Disable' : 'Enable'} Hotkey
      </button>
      <pre class="code-block">{`let enabled = $state(true)

createHotkey(
  'Mod+E',
  (event, { hotkey }) => {
    alert('Triggered!')
  },
  () => ({ enabled })
)`}</pre>
    </section>

    <section class="demo-section">
      <h2>Number Key Combinations</h2>
      <p>Common for tab/section switching:</p>
      <div class="hotkey-grid">
        <div><kbd>{formatForDisplay('Mod+1')}</kbd> → Tab 1</div>
        <div><kbd>{formatForDisplay('Mod+2')}</kbd> → Tab 2</div>
        <div><kbd>{formatForDisplay('Mod+3')}</kbd> → Tab 3</div>
        <div><kbd>{formatForDisplay('Mod+4')}</kbd> → Tab 4</div>
        <div><kbd>{formatForDisplay('Mod+5')}</kbd> → Tab 5</div>
      </div>
      <div class="counter">Active Tab: {activeTab}</div>
      <pre class="code-block">{`createHotkey('Mod+1', () => activeTab = 1)
createHotkey('Mod+2', () => activeTab = 2)`}</pre>
    </section>

    <section class="demo-section">
      <h2>Navigation Key Combinations</h2>
      <p>Selection and navigation shortcuts:</p>
      <div class="hotkey-grid">
        <div><kbd>{formatForDisplay('Shift+ArrowUp')}</kbd> — Select up</div>
        <div>
          <kbd>{formatForDisplay('Shift+ArrowDown')}</kbd> — Select down
        </div>
        <div>
          <kbd>{formatForDisplay('Alt+ArrowLeft')}</kbd> — Navigate back
        </div>
        <div>
          <kbd>{formatForDisplay('Alt+ArrowRight')}</kbd> — Navigate forward
        </div>
        <div><kbd>{formatForDisplay('Mod+Home')}</kbd> — Go to start</div>
        <div><kbd>{formatForDisplay('Mod+End')}</kbd> — Go to end</div>
        <div>
          <kbd>{formatForDisplay('Control+PageUp')}</kbd> — Previous page
        </div>
        <div>
          <kbd>{formatForDisplay('Control+PageDown')}</kbd> — Next page
        </div>
      </div>
      <div class="counter">Navigation triggered: {navigationCount}x</div>
    </section>

    <section class="demo-section">
      <h2>Function Key Combinations</h2>
      <p>System and application shortcuts:</p>
      <div class="hotkey-grid">
        <div><kbd>{formatForDisplay('Alt+F4')}</kbd> — Close window</div>
        <div><kbd>{formatForDisplay('Control+F5')}</kbd> — Hard refresh</div>
        <div><kbd>{formatForDisplay('Mod+F1')}</kbd> — Help</div>
        <div><kbd>{formatForDisplay('Shift+F10')}</kbd> — Context menu</div>
        <div><kbd>{formatForDisplay('F12')}</kbd> — DevTools</div>
      </div>
      <div class="counter">Function keys triggered: {functionKeyCount}x</div>
    </section>

    <section class="demo-section">
      <h2>Multi-Modifier Combinations</h2>
      <p>Complex shortcuts with multiple modifiers:</p>
      <div class="hotkey-grid">
        <div><kbd>{formatForDisplay('Mod+Shift+S')}</kbd> — Save As</div>
        <div><kbd>{formatForDisplay('Mod+Shift+Z')}</kbd> — Redo</div>
        <div>
          <kbd>{formatForDisplay('Control+Alt+A')}</kbd> — Special action
        </div>
        <div>
          <kbd>{formatForDisplay('Control+Shift+N')}</kbd> — New incognito
        </div>
        <div><kbd>{formatForDisplay('Mod+Alt+T')}</kbd> — Toggle theme</div>
        <div>
          <kbd>{formatForDisplay('Control+Alt+Shift+X')}</kbd> — Triple modifier
        </div>
      </div>
      <div class="counter">
        Multi-modifier triggered: {multiModifierCount}x
      </div>
    </section>

    <section class="demo-section">
      <h2>Editing Key Combinations</h2>
      <p>Text editing and form shortcuts:</p>
      <div class="hotkey-grid">
        <div><kbd>{formatForDisplay('Mod+Enter')}</kbd> — Submit form</div>
        <div><kbd>{formatForDisplay('Shift+Enter')}</kbd> — New line</div>
        <div>
          <kbd>{formatForDisplay('Mod+Backspace')}</kbd> — Delete word
        </div>
        <div>
          <kbd>{formatForDisplay('Mod+Delete')}</kbd> — Delete forward
        </div>
        <div><kbd>{formatForDisplay('Control+Tab')}</kbd> — Next tab</div>
        <div><kbd>{formatForDisplay('Shift+Tab')}</kbd> — Previous field</div>
        <div><kbd>{formatForDisplay('Mod+Space')}</kbd> — Toggle</div>
      </div>
      <div class="counter">Editing keys triggered: {editingKeyCount}x</div>
    </section>

    {#if lastHotkey}
      <div class="info-box">
        <strong>Last triggered:</strong>
        {formatForDisplay(lastHotkey)}
      </div>
    {/if}

    <p class="hint">
      Press <kbd>Escape</kbd> to reset all counters
    </p>

    <section class="demo-section scoped-section">
      <h2>Scoped Keyboard Shortcuts</h2>
      <p>
        Shortcuts can be scoped to specific DOM elements using the
        <code>target</code> option. This allows different shortcuts to work in different
        parts of your application.
      </p>

      <div class="scoped-grid">
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div
          class="scoped-area"
          tabindex="0"
          role="region"
          aria-label="Sidebar scoped area"
          {@attach sidebarBoldHotkey}
          {@attach sidebarNewItemHotkey}
        >
          <h3>Sidebar (Scoped Area)</h3>
          <p>Click here to focus, then try:</p>
          <div class="hotkey-list">
            <div>
              <kbd>{formatForDisplay('Mod+B')}</kbd> — Trigger sidebar action
            </div>
            <div><kbd>{formatForDisplay('Mod+N')}</kbd> — New item</div>
          </div>
          <div class="counter">
            Sidebar shortcuts: {sidebarShortcutCount}x
          </div>
          <p class="hint">
            These shortcuts only work when this sidebar area is focused or
            contains focus.
          </p>
        </div>

        <div class="scoped-area">
          <h3>Modal Dialog</h3>
          <button onclick={() => (modalOpen = true)}>Open Modal</button>
          {#if modalOpen}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <div
              class="modal-overlay"
              onclick={() => (modalOpen = false)}
              role="button"
              tabindex="-1"
            >
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <div
                class="modal-content"
                bind:this={modalRef}
                tabindex="0"
                onclick={(e) => e.stopPropagation()}
                role="dialog"
                {@attach closeModalHotkey}
                {@attach submitModalHotkey}
              >
                <h3>Modal Dialog (Scoped)</h3>
                <p>Try these shortcuts while modal is open:</p>
                <div class="hotkey-list">
                  <div>
                    <kbd>{formatForDisplay('Escape')}</kbd> — Close modal
                  </div>
                  <div>
                    <kbd>{formatForDisplay('Mod+Enter')}</kbd> — Submit
                  </div>
                </div>
                <div class="counter">
                  Modal shortcuts: {modalShortcutCount}x
                </div>
                <p class="hint">
                  These shortcuts only work when the modal is open and focused.
                  The Escape key here won't conflict with the global Escape
                  handler.
                </p>
                <button onclick={() => (modalOpen = false)}>Close</button>
              </div>
            </div>
          {/if}
        </div>

        <div class="scoped-area">
          <h3>Text Editor (Scoped)</h3>
          <p>Focus the editor below and try:</p>
          <div class="hotkey-list">
            <div>
              <kbd>{formatForDisplay('Mod+S')}</kbd> — Save editor content
            </div>
            <div><kbd>{formatForDisplay('Mod+/')}</kbd> — Add comment</div>
            <div><kbd>{formatForDisplay('Mod+K')}</kbd> — Clear editor</div>
          </div>
          <textarea
            class="scoped-editor"
            bind:value={editorContent}
            placeholder="Focus here and try the shortcuts above..."
            rows="8"
            {@attach saveEditorHotkey}
            {@attach addEditorCommentHotkey}
            {@attach clearEditorHotkey}
          ></textarea>
          <div class="counter">Editor shortcuts: {editorShortcutCount}x</div>
          <p class="hint">
            These shortcuts only work when the editor is focused. Notice that <kbd
              >{formatForDisplay('Mod+S')}</kbd
            >
            here doesn't conflict with the global
            <kbd>{formatForDisplay('Mod+S')}</kbd>
            shortcut.
          </p>
        </div>
      </div>

      <pre class="code-block">{`const sidebarHotkey = createHotkeyAttachment(
  'Mod+B',
  () => console.log('Sidebar shortcut!'),
)

const modalEscape = createHotkeyAttachment(
  'Escape',
  () => (modalOpen = false),
  () => ({ enabled: modalOpen }),
)

const editorSave = createHotkeyAttachment('Mod+S', () => {
  saveEditorContent()
})`}</pre>
    </section>
  </main>
</div>
