/* @refresh reload */
import { render } from 'solid-js/web'
import { createSignal, createEffect, Show } from 'solid-js'
import {
  formatForDisplay,
  createHotkey,
  HotkeysProvider,
} from '@tanstack/solid-hotkeys'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'
import { TanStackDevtools } from '@tanstack/solid-devtools'
import type { Hotkey } from '@tanstack/solid-hotkeys'
import './index.css'

function App() {
  const [lastHotkey, setLastHotkey] = createSignal<Hotkey | null>(null)
  const [saveCount, setSaveCount] = createSignal(0)
  const [incrementCount, setIncrementCount] = createSignal(0)
  const [enabled, setEnabled] = createSignal(true)
  const [activeTab, setActiveTab] = createSignal(1)
  const [navigationCount, setNavigationCount] = createSignal(0)
  const [functionKeyCount, setFunctionKeyCount] = createSignal(0)
  const [multiModifierCount, setMultiModifierCount] = createSignal(0)
  const [editingKeyCount, setEditingKeyCount] = createSignal(0)

  const [modalOpen, setModalOpen] = createSignal(false)
  const [editorContent, setEditorContent] = createSignal('')
  const [sidebarShortcutCount, setSidebarShortcutCount] = createSignal(0)
  const [modalShortcutCount, setModalShortcutCount] = createSignal(0)
  const [editorShortcutCount, setEditorShortcutCount] = createSignal(0)

  const [sidebarRef, setSidebarRef] = createSignal<HTMLDivElement | null>(null)
  const [modalRef, setModalRef] = createSignal<HTMLDivElement | null>(null)
  const [editorRef, setEditorRef] = createSignal<HTMLTextAreaElement | null>(
    null,
  )

  createHotkey('Mod+S', (_event, { hotkey, parsedHotkey }) => {
    setLastHotkey(hotkey)
    setSaveCount((c) => c + 1)
    console.log('Hotkey triggered:', hotkey)
    console.log('Parsed hotkey:', parsedHotkey)
  })

  createHotkey(
    'Mod+K',
    (_event, { hotkey }) => {
      setLastHotkey(hotkey)
      setIncrementCount((c) => c + 1)
    },
    { requireReset: true },
  )

  createHotkey(
    'Mod+E',
    (_event, { hotkey }) => {
      setLastHotkey(hotkey)
      alert('This hotkey can be toggled!')
    },
    () => ({ enabled: enabled() }),
  )

  createHotkey('Mod+1', () => {
    setLastHotkey('Mod+1')
    setActiveTab(1)
  })
  createHotkey('Mod+2', () => {
    setLastHotkey('Mod+2')
    setActiveTab(2)
  })
  createHotkey('Mod+3', () => {
    setLastHotkey('Mod+3')
    setActiveTab(3)
  })
  createHotkey('Mod+4', () => {
    setLastHotkey('Mod+4')
    setActiveTab(4)
  })
  createHotkey('Mod+5', () => {
    setLastHotkey('Mod+5')
    setActiveTab(5)
  })

  createHotkey('Shift+ArrowUp', () => {
    setLastHotkey('Shift+ArrowUp')
    setNavigationCount((c) => c + 1)
  })
  createHotkey('Shift+ArrowDown', () => {
    setLastHotkey('Shift+ArrowDown')
    setNavigationCount((c) => c + 1)
  })
  createHotkey('Alt+ArrowLeft', () => {
    setLastHotkey('Alt+ArrowLeft')
    setNavigationCount((c) => c + 1)
  })
  createHotkey('Alt+ArrowRight', () => {
    setLastHotkey('Alt+ArrowRight')
    setNavigationCount((c) => c + 1)
  })
  createHotkey('Mod+Home', () => {
    setLastHotkey('Mod+Home')
    setNavigationCount((c) => c + 1)
  })
  createHotkey('Mod+End', () => {
    setLastHotkey('Mod+End')
    setNavigationCount((c) => c + 1)
  })
  createHotkey('Control+PageUp', () => {
    setLastHotkey('Control+PageUp')
    setNavigationCount((c) => c + 1)
  })
  createHotkey('Control+PageDown', () => {
    setLastHotkey('Control+PageDown')
    setNavigationCount((c) => c + 1)
  })

  createHotkey('Meta+F4', () => {
    setLastHotkey('Alt+F4')
    setFunctionKeyCount((c) => c + 1)
    alert('Alt+F4 pressed (normally closes window)')
  })
  createHotkey('Control+F5', () => {
    setLastHotkey('Control+F5')
    setFunctionKeyCount((c) => c + 1)
  })
  createHotkey('Mod+F1', () => {
    setLastHotkey('Mod+F1')
    setFunctionKeyCount((c) => c + 1)
  })
  createHotkey('Shift+F10', () => {
    setLastHotkey('Shift+F10')
    setFunctionKeyCount((c) => c + 1)
  })

  createHotkey('Mod+Shift+S', () => {
    setLastHotkey('Mod+Shift+S')
    setMultiModifierCount((c) => c + 1)
  })
  createHotkey('Mod+Shift+Z', () => {
    setLastHotkey('Mod+Shift+Z')
    setMultiModifierCount((c) => c + 1)
  })
  createHotkey({ key: 'A', ctrl: true, alt: true }, () => {
    setLastHotkey('Control+Alt+A')
    setMultiModifierCount((c) => c + 1)
  })
  createHotkey('Control+Shift+N', () => {
    setLastHotkey('Control+Shift+N')
    setMultiModifierCount((c) => c + 1)
  })
  createHotkey('Mod+Alt+T', () => {
    setLastHotkey('Mod+Alt+T')
    setMultiModifierCount((c) => c + 1)
  })
  createHotkey('Control+Alt+Shift+X', () => {
    setLastHotkey('Control+Alt+Shift+X')
    setMultiModifierCount((c) => c + 1)
  })

  createHotkey('Mod+Enter', () => {
    setLastHotkey('Mod+Enter')
    setEditingKeyCount((c) => c + 1)
  })
  createHotkey('Shift+Enter', () => {
    setLastHotkey('Shift+Enter')
    setEditingKeyCount((c) => c + 1)
  })
  createHotkey('Mod+Backspace', () => {
    setLastHotkey('Mod+Backspace')
    setEditingKeyCount((c) => c + 1)
  })
  createHotkey('Mod+Delete', () => {
    setLastHotkey('Mod+Delete')
    setEditingKeyCount((c) => c + 1)
  })
  createHotkey('Control+Tab', () => {
    setLastHotkey('Control+Tab')
    setEditingKeyCount((c) => c + 1)
  })
  createHotkey('Shift+Tab', () => {
    setLastHotkey('Shift+Tab')
    setEditingKeyCount((c) => c + 1)
  })
  createHotkey('Mod+Space', () => {
    setLastHotkey('Mod+Space')
    setEditingKeyCount((c) => c + 1)
  })

  createHotkey({ key: 'Escape' }, () => {
    setLastHotkey(null)
    setSaveCount(0)
    setIncrementCount(0)
    setNavigationCount(0)
    setFunctionKeyCount(0)
    setMultiModifierCount(0)
    setEditingKeyCount(0)
    setActiveTab(1)
  })
  createHotkey('F12', () => {
    setLastHotkey('F12')
    setFunctionKeyCount((c) => c + 1)
  })

  createEffect(() => {
    if (modalOpen()) {
      modalRef()?.focus()
    }
  })

  createHotkey(
    'Mod+B',
    () => {
      setLastHotkey('Mod+B')
      setSidebarShortcutCount((c) => c + 1)
      alert(
        'Sidebar shortcut triggered! This only works when the sidebar area is focused.',
      )
    },
    () => ({ target: sidebarRef() }),
  )
  createHotkey(
    'Mod+N',
    () => {
      setLastHotkey('Mod+N')
      setSidebarShortcutCount((c) => c + 1)
    },
    () => ({ target: sidebarRef() }),
  )

  createHotkey(
    'Escape',
    () => {
      setLastHotkey('Escape')
      setModalShortcutCount((c) => c + 1)
      setModalOpen(false)
    },
    () => ({ target: modalRef(), enabled: modalOpen() }),
  )
  createHotkey(
    'Mod+Enter',
    () => {
      setLastHotkey('Mod+Enter')
      setModalShortcutCount((c) => c + 1)
      alert('Modal submit shortcut!')
    },
    () => ({ target: modalRef(), enabled: modalOpen() }),
  )

  createHotkey(
    'Mod+S',
    () => {
      setLastHotkey('Mod+S')
      setEditorShortcutCount((c) => c + 1)
      const content = editorContent()
      alert(
        `Editor content saved: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
      )
    },
    () => ({ target: editorRef() }),
  )
  createHotkey(
    'Mod+/',
    () => {
      setLastHotkey('Mod+/')
      setEditorShortcutCount((c) => c + 1)
      setEditorContent((prev) => prev + '\n// Comment added via shortcut')
    },
    () => ({ target: editorRef() }),
  )
  createHotkey(
    'Mod+K',
    () => {
      setLastHotkey('Mod+K')
      setEditorShortcutCount((c) => c + 1)
      setEditorContent('')
    },
    () => ({ target: editorRef() }),
  )

  return (
    <div class="app">
      <header>
        <h1>createHotkey</h1>
        <p>
          Register keyboard shortcuts with callback context containing the
          hotkey and parsed hotkey information.
        </p>
      </header>

      <main>
        <section class="demo-section">
          <h2>Basic Hotkey</h2>
          <p>
            Press <kbd>{formatForDisplay('Mod+S')}</kbd> to trigger
          </p>
          <div class="counter">Save triggered: {saveCount()}x</div>
          <pre class="code-block">{`createHotkey('Mod+S', (_event, { hotkey, parsedHotkey }) => {
  console.log('Hotkey:', hotkey)
  console.log('Parsed:', parsedHotkey)
})`}</pre>
        </section>

        <section class="demo-section">
          <h2>With requireReset</h2>
          <p>
            Hold <kbd>{formatForDisplay('Mod+K')}</kbd> — only increments once
            until you release all keys
          </p>
          <div class="counter">Increment: {incrementCount()}</div>
          <p class="hint">
            This prevents repeated triggering while holding the keys down.
            Release all keys to allow re-triggering.
          </p>
          <pre class="code-block">{`createHotkey(
  'Mod+K',
  (event, { hotkey }) => {
    setCount(c => c + 1)
  },
  { requireReset: true }
)`}</pre>
        </section>

        <section class="demo-section">
          <h2>Conditional Hotkey</h2>
          <p>
            <kbd>{formatForDisplay('Mod+E')}</kbd> is currently{' '}
            <strong>{enabled() ? 'enabled' : 'disabled'}</strong>
          </p>
          <button onClick={() => setEnabled((e) => !e)}>
            {enabled() ? 'Disable' : 'Enable'} Hotkey
          </button>
          <pre class="code-block">{`const [enabled, setEnabled] = createSignal(true)

createHotkey(
  'Mod+E',
  (event, { hotkey }) => {
    alert('Triggered!')
  },
  () => ({ enabled: enabled() })
)`}</pre>
        </section>

        <section class="demo-section">
          <h2>Number Key Combinations</h2>
          <p>Common for tab/section switching:</p>
          <div class="hotkey-grid">
            <div>
              <kbd>{formatForDisplay('Mod+1')}</kbd> → Tab 1
            </div>
            <div>
              <kbd>{formatForDisplay('Mod+2')}</kbd> → Tab 2
            </div>
            <div>
              <kbd>{formatForDisplay('Mod+3')}</kbd> → Tab 3
            </div>
            <div>
              <kbd>{formatForDisplay('Mod+4')}</kbd> → Tab 4
            </div>
            <div>
              <kbd>{formatForDisplay('Mod+5')}</kbd> → Tab 5
            </div>
          </div>
          <div class="counter">Active Tab: {activeTab()}</div>
          <pre class="code-block">{`createHotkey('Mod+1', () => setActiveTab(1))
createHotkey('Mod+2', () => setActiveTab(2))
`}</pre>
        </section>

        <section class="demo-section">
          <h2>Navigation Key Combinations</h2>
          <p>Selection and navigation shortcuts:</p>
          <div class="hotkey-grid">
            <div>
              <kbd>{formatForDisplay('Shift+ArrowUp')}</kbd> — Select up
            </div>
            <div>
              <kbd>{formatForDisplay('Shift+ArrowDown')}</kbd> — Select down
            </div>
            <div>
              <kbd>{formatForDisplay('Alt+ArrowLeft')}</kbd> — Navigate back
            </div>
            <div>
              <kbd>{formatForDisplay('Alt+ArrowRight')}</kbd> — Navigate forward
            </div>
            <div>
              <kbd>{formatForDisplay('Mod+Home')}</kbd> — Go to start
            </div>
            <div>
              <kbd>{formatForDisplay('Mod+End')}</kbd> — Go to end
            </div>
            <div>
              <kbd>{formatForDisplay('Control+PageUp')}</kbd> — Previous page
            </div>
            <div>
              <kbd>{formatForDisplay('Control+PageDown')}</kbd> — Next page
            </div>
          </div>
          <div class="counter">Navigation triggered: {navigationCount()}x</div>
          <pre class="code-block">{`createHotkey('Shift+ArrowUp', () => selectUp())
createHotkey('Alt+ArrowLeft', () => navigateBack())
createHotkey('Mod+Home', () => goToStart())
createHotkey('Control+PageUp', () => previousPage())`}</pre>
        </section>

        <section class="demo-section">
          <h2>Function Key Combinations</h2>
          <p>System and application shortcuts:</p>
          <div class="hotkey-grid">
            <div>
              <kbd>{formatForDisplay('Alt+F4')}</kbd> — Close window
            </div>
            <div>
              <kbd>{formatForDisplay('Control+F5')}</kbd> — Hard refresh
            </div>
            <div>
              <kbd>{formatForDisplay('Mod+F1')}</kbd> — Help
            </div>
            <div>
              <kbd>{formatForDisplay('Shift+F10')}</kbd> — Context menu
            </div>
            <div>
              <kbd>{formatForDisplay('F12')}</kbd> — DevTools
            </div>
          </div>
          <div class="counter">
            Function keys triggered: {functionKeyCount()}x
          </div>
          <pre class="code-block">{`createHotkey('Alt+F4', () => closeWindow())
createHotkey('Control+F5', () => hardRefresh())
createHotkey('Mod+F1', () => showHelp())
createHotkey('F12', () => openDevTools())`}</pre>
        </section>

        <section class="demo-section">
          <h2>Multi-Modifier Combinations</h2>
          <p>Complex shortcuts with multiple modifiers:</p>
          <div class="hotkey-grid">
            <div>
              <kbd>{formatForDisplay('Mod+Shift+S')}</kbd> — Save As
            </div>
            <div>
              <kbd>{formatForDisplay('Mod+Shift+Z')}</kbd> — Redo
            </div>
            <div>
              <kbd>{formatForDisplay('Control+Alt+A')}</kbd> — Special action
            </div>
            <div>
              <kbd>{formatForDisplay('Control+Shift+N')}</kbd> — New incognito
            </div>
            <div>
              <kbd>{formatForDisplay('Mod+Alt+T')}</kbd> — Toggle theme
            </div>
            <div>
              <kbd>{formatForDisplay('Control+Alt+Shift+X')}</kbd> — Triple
              modifier
            </div>
          </div>
          <div class="counter">
            Multi-modifier triggered: {multiModifierCount()}x
          </div>
          <pre class="code-block">{`createHotkey('Mod+Shift+S', () => saveAs())
createHotkey('Mod+Shift+Z', () => redo())
createHotkey('Control+Alt+A', () => specialAction())
createHotkey('Control+Alt+Shift+X', () => complexAction())`}</pre>
        </section>

        <section class="demo-section">
          <h2>Editing Key Combinations</h2>
          <p>Text editing and form shortcuts:</p>
          <div class="hotkey-grid">
            <div>
              <kbd>{formatForDisplay('Mod+Enter')}</kbd> — Submit form
            </div>
            <div>
              <kbd>{formatForDisplay('Shift+Enter')}</kbd> — New line
            </div>
            <div>
              <kbd>{formatForDisplay('Mod+Backspace')}</kbd> — Delete word
            </div>
            <div>
              <kbd>{formatForDisplay('Mod+Delete')}</kbd> — Delete forward
            </div>
            <div>
              <kbd>{formatForDisplay('Control+Tab')}</kbd> — Next tab
            </div>
            <div>
              <kbd>{formatForDisplay('Shift+Tab')}</kbd> — Previous field
            </div>
            <div>
              <kbd>{formatForDisplay('Mod+Space')}</kbd> — Toggle
            </div>
          </div>
          <div class="counter">
            Editing keys triggered: {editingKeyCount()}x
          </div>
          <pre class="code-block">{`createHotkey('Mod+Enter', () => submitForm())
createHotkey('Shift+Enter', () => insertNewline())
createHotkey('Mod+Backspace', () => deleteWord())
createHotkey('Control+Tab', () => nextTab())
createHotkey('Mod+Space', () => toggle())`}</pre>
        </section>

        <Show when={lastHotkey()}>
          <div class="info-box">
            <strong>Last triggered:</strong> {formatForDisplay(lastHotkey()!)}
          </div>
        </Show>

        <p class="hint">
          Press <kbd>Escape</kbd> to reset all counters
        </p>

        <section class="demo-section scoped-section">
          <h2>Scoped Keyboard Shortcuts</h2>
          <p>
            Shortcuts can be scoped to specific DOM elements using the{' '}
            <code>target</code> option. Use an accessor for reactive targets:{' '}
            <code>() =&gt; (&#123; target: ref() &#125;)</code>
          </p>

          <div class="scoped-grid">
            <div class="scoped-area" ref={setSidebarRef} tabIndex={0}>
              <h3>Sidebar (Scoped Area)</h3>
              <p>Click here to focus, then try:</p>
              <div class="hotkey-list">
                <div>
                  <kbd>{formatForDisplay('Mod+B')}</kbd> — Trigger sidebar
                  action
                </div>
                <div>
                  <kbd>{formatForDisplay('Mod+N')}</kbd> — New item
                </div>
              </div>
              <div class="counter">
                Sidebar shortcuts: {sidebarShortcutCount()}x
              </div>
              <p class="hint">
                These shortcuts only work when this sidebar area is focused or
                contains focus.
              </p>
            </div>

            <div class="scoped-area">
              <h3>Modal Dialog</h3>
              <button onClick={() => setModalOpen(true)}>Open Modal</button>
              <Show when={modalOpen()}>
                <div class="modal-overlay" onClick={() => setModalOpen(false)}>
                  <div
                    class="modal-content"
                    ref={setModalRef}
                    tabIndex={0}
                    onClick={(e) => e.stopPropagation()}
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
                      Modal shortcuts: {modalShortcutCount()}x
                    </div>
                    <p class="hint">
                      These shortcuts only work when the modal is open and
                      focused. The Escape key here won't conflict with the
                      global Escape handler.
                    </p>
                    <button onClick={() => setModalOpen(false)}>Close</button>
                  </div>
                </div>
              </Show>
            </div>

            <div class="scoped-area">
              <h3>Text Editor (Scoped)</h3>
              <p>Focus the editor below and try:</p>
              <div class="hotkey-list">
                <div>
                  <kbd>{formatForDisplay('Mod+S')}</kbd> — Save editor content
                </div>
                <div>
                  <kbd>{formatForDisplay('Mod+/')}</kbd> — Add comment
                </div>
                <div>
                  <kbd>{formatForDisplay('Mod+K')}</kbd> — Clear editor
                </div>
              </div>
              <textarea
                ref={setEditorRef}
                class="scoped-editor"
                value={editorContent()}
                onInput={(e) => setEditorContent(e.currentTarget.value)}
                placeholder="Focus here and try the shortcuts above..."
                rows={8}
              />
              <div class="counter">
                Editor shortcuts: {editorShortcutCount()}x
              </div>
              <p class="hint">
                These shortcuts only work when the editor is focused. Notice
                that <kbd>{formatForDisplay('Mod+S')}</kbd> here doesn't
                conflict with the global <kbd>{formatForDisplay('Mod+S')}</kbd>{' '}
                shortcut.
              </p>
            </div>
          </div>

          <pre class="code-block">{`// Scoped to a signal (Solid pattern)
const [sidebarRef, setSidebarRef] = createSignal<HTMLDivElement | null>(null)

createHotkey(
  'Mod+B',
  () => console.log('Sidebar shortcut!'),
  () => ({ target: sidebarRef() })
)

// Scoped to a modal (only when open)
const [modalRef, setModalRef] = createSignal<HTMLDivElement | null>(null)
const [isOpen, setIsOpen] = createSignal(false)

createHotkey(
  'Escape',
  () => setIsOpen(false),
  () => ({ target: modalRef(), enabled: isOpen() })
)

// Scoped to an editor
const [editorRef, setEditorRef] = createSignal<HTMLTextAreaElement | null>(null)

createHotkey(
  'Mod+S',
  () => saveEditorContent(),
  () => ({ target: editorRef() })
)`}</pre>
        </section>
      </main>

      <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
    </div>
  )
}

const root = document.getElementById('root')!
render(
  () => (
    <HotkeysProvider>
      <App />
    </HotkeysProvider>
  ),
  root,
)
