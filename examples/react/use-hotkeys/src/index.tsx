import React from 'react'
import ReactDOM from 'react-dom/client'
import { formatForDisplay, useHotkey } from '@tanstack/react-keys'
import type { Hotkey } from '@tanstack/react-keys'
import './index.css'

function App() {
  const [lastHotkey, setLastHotkey] = React.useState<Hotkey | null>(null)
  const [saveCount, setSaveCount] = React.useState(0)
  const [incrementCount, setIncrementCount] = React.useState(0)
  const [enabled, setEnabled] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState(1)
  const [navigationCount, setNavigationCount] = React.useState(0)
  const [functionKeyCount, setFunctionKeyCount] = React.useState(0)
  const [multiModifierCount, setMultiModifierCount] = React.useState(0)
  const [editingKeyCount, setEditingKeyCount] = React.useState(0)

  // Scoped shortcuts state
  const [modalOpen, setModalOpen] = React.useState(false)
  const [editorContent, setEditorContent] = React.useState('')
  const [sidebarShortcutCount, setSidebarShortcutCount] = React.useState(0)
  const [modalShortcutCount, setModalShortcutCount] = React.useState(0)
  const [editorShortcutCount, setEditorShortcutCount] = React.useState(0)

  // Refs for scoped shortcuts
  const sidebarRef = React.useRef<HTMLDivElement>(null)
  const modalRef = React.useRef<HTMLDivElement>(null)
  const editorRef = React.useRef<HTMLTextAreaElement>(null)

  // Type-safe refs for useHotkey (HTMLTextAreaElement extends HTMLElement)
  const editorRefForHotkey = editorRef as React.RefObject<HTMLElement | null>

  // ============================================================================
  // Basic Hotkeys
  // ============================================================================

  // Basic hotkey with callback context
  useHotkey(
    'Mod+S',
    (event, { hotkey, parsedHotkey }) => {
      event.preventDefault()
      setLastHotkey(hotkey)
      setSaveCount((c) => c + 1)
      console.log('Hotkey triggered:', hotkey)
      console.log('Parsed hotkey:', parsedHotkey)
    },
    { preventDefault: true },
  )

  // requireReset prevents repeated triggering while holding keys
  useHotkey(
    'Mod+K',
    (_event, { hotkey }) => {
      setLastHotkey(hotkey)
      setIncrementCount((c) => c + 1)
    },
    { requireReset: true },
  )

  // Conditional hotkey (enabled/disabled)
  useHotkey(
    'Mod+E',
    (_event, { hotkey }) => {
      setLastHotkey(hotkey)
      alert('This hotkey can be toggled!')
    },
    { enabled },
  )

  // ============================================================================
  // Number Key Combinations (Tab/Section Switching)
  // ============================================================================

  useHotkey('Mod+1', () => {
    setLastHotkey('Mod+1')
    setActiveTab(1)
  })

  useHotkey('Mod+2', () => {
    setLastHotkey('Mod+2')
    setActiveTab(2)
  })

  useHotkey('Mod+3', () => {
    setLastHotkey('Mod+3')
    setActiveTab(3)
  })

  useHotkey('Mod+4', () => {
    setLastHotkey('Mod+4')
    setActiveTab(4)
  })

  useHotkey('Mod+5', () => {
    setLastHotkey('Mod+5')
    setActiveTab(5)
  })

  useHotkey('Control+0', () => {
    setLastHotkey('Control+0')
    setActiveTab(0)
  })

  useHotkey('Alt+9', () => {
    setLastHotkey('Alt+9')
    setActiveTab(9)
  })

  // ============================================================================
  // Navigation Key Combinations
  // ============================================================================

  useHotkey('Shift+ArrowUp', () => {
    setLastHotkey('Shift+ArrowUp')
    setNavigationCount((c) => c + 1)
  })

  useHotkey('Shift+ArrowDown', () => {
    setLastHotkey('Shift+ArrowDown')
    setNavigationCount((c) => c + 1)
  })

  useHotkey('Alt+ArrowLeft', () => {
    setLastHotkey('Alt+ArrowLeft')
    setNavigationCount((c) => c + 1)
  })

  useHotkey('Alt+ArrowRight', () => {
    setLastHotkey('Alt+ArrowRight')
    setNavigationCount((c) => c + 1)
  })

  useHotkey('Mod+Home', () => {
    setLastHotkey('Mod+Home')
    setNavigationCount((c) => c + 1)
  })

  useHotkey('Mod+End', () => {
    setLastHotkey('Mod+End')
    setNavigationCount((c) => c + 1)
  })

  useHotkey('Control+PageUp', () => {
    setLastHotkey('Control+PageUp')
    setNavigationCount((c) => c + 1)
  })

  useHotkey('Control+PageDown', () => {
    setLastHotkey('Control+PageDown')
    setNavigationCount((c) => c + 1)
  })

  // ============================================================================
  // Function Key Combinations
  // ============================================================================

  useHotkey('Meta+F4', () => {
    setLastHotkey('Alt+F4')
    setFunctionKeyCount((c) => c + 1)
    alert('Alt+F4 pressed (normally closes window)')
  })

  useHotkey('Control+F5', () => {
    setLastHotkey('Control+F5')
    setFunctionKeyCount((c) => c + 1)
  })

  useHotkey('Mod+F1', () => {
    setLastHotkey('Mod+F1')
    setFunctionKeyCount((c) => c + 1)
  })

  useHotkey('Shift+F10', () => {
    setLastHotkey('Shift+F10')
    setFunctionKeyCount((c) => c + 1)
  })

  // ============================================================================
  // Multi-Modifier Combinations
  // ============================================================================

  useHotkey('Mod+Shift+S', () => {
    setLastHotkey('Mod+Shift+S')
    setMultiModifierCount((c) => c + 1)
  })

  useHotkey('Mod+Shift+Z', () => {
    setLastHotkey('Mod+Shift+Z')
    setMultiModifierCount((c) => c + 1)
  })

  useHotkey('Control+Alt+A', () => {
    setLastHotkey('Control+Alt+A')
    setMultiModifierCount((c) => c + 1)
  })

  useHotkey('Control+Shift+N', () => {
    setLastHotkey('Control+Shift+N')
    setMultiModifierCount((c) => c + 1)
  })

  useHotkey('Mod+Alt+T', () => {
    setLastHotkey('Mod+Alt+T')
    setMultiModifierCount((c) => c + 1)
  })

  useHotkey('Control+Alt+Shift+X', () => {
    setLastHotkey('Control+Alt+Shift+X')
    setMultiModifierCount((c) => c + 1)
  })

  // ============================================================================
  // Editing Key Combinations
  // ============================================================================

  useHotkey('Mod+Enter', () => {
    setLastHotkey('Mod+Enter')
    setEditingKeyCount((c) => c + 1)
  })

  useHotkey('Shift+Enter', () => {
    setLastHotkey('Shift+Enter')
    setEditingKeyCount((c) => c + 1)
  })

  useHotkey('Mod+Backspace', () => {
    setLastHotkey('Mod+Backspace')
    setEditingKeyCount((c) => c + 1)
  })

  useHotkey('Mod+Delete', () => {
    setLastHotkey('Mod+Delete')
    setEditingKeyCount((c) => c + 1)
  })

  useHotkey('Control+Tab', () => {
    setLastHotkey('Control+Tab')
    setEditingKeyCount((c) => c + 1)
  })

  useHotkey('Shift+Tab', () => {
    setLastHotkey('Shift+Tab')
    setEditingKeyCount((c) => c + 1)
  })

  useHotkey('Mod+Space', () => {
    setLastHotkey('Mod+Space')
    setEditingKeyCount((c) => c + 1)
  })

  // ============================================================================
  // Single Keys
  // ============================================================================

  // Clear with Escape
  useHotkey('Escape', () => {
    setLastHotkey(null)
    setSaveCount(0)
    setIncrementCount(0)
    setNavigationCount(0)
    setFunctionKeyCount(0)
    setMultiModifierCount(0)
    setEditingKeyCount(0)
    setActiveTab(1)
  })

  useHotkey('F12', () => {
    setLastHotkey('F12')
    setFunctionKeyCount((c) => c + 1)
  })

  // ============================================================================
  // Scoped Keyboard Shortcuts
  // ============================================================================

  // Scoped to sidebar - only works when sidebar is focused or contains focus
  useHotkey(
    'Mod+B',
    () => {
      setLastHotkey('Mod+B')
      setSidebarShortcutCount((c) => c + 1)
      alert(
        'Sidebar shortcut triggered! This only works when the sidebar area is focused.',
      )
    },
    { target: sidebarRef },
  )

  useHotkey(
    'Mod+N',
    () => {
      setLastHotkey('Mod+N')
      setSidebarShortcutCount((c) => c + 1)
    },
    { target: sidebarRef },
  )

  // Scoped to modal - only works when modal is open and focused
  useHotkey(
    'Escape',
    () => {
      setLastHotkey('Escape')
      setModalShortcutCount((c) => c + 1)
      setModalOpen(false)
    },
    { target: modalRef, enabled: modalOpen },
  )

  useHotkey(
    'Mod+Enter',
    () => {
      setLastHotkey('Mod+Enter')
      setModalShortcutCount((c) => c + 1)
      alert('Modal submit shortcut!')
    },
    { target: modalRef, enabled: modalOpen },
  )

  // Scoped to editor - only works when editor is focused
  useHotkey(
    'Mod+S',
    () => {
      setLastHotkey('Mod+S')
      setEditorShortcutCount((c) => c + 1)
      alert(
        `Editor content saved: "${editorContent.substring(0, 50)}${editorContent.length > 50 ? '...' : ''}"`,
      )
    },
    { target: editorRefForHotkey },
  )

  useHotkey(
    'Mod+/',
    () => {
      setLastHotkey('Mod+/')
      setEditorShortcutCount((c) => c + 1)
      setEditorContent((prev) => prev + '\n// Comment added via shortcut')
    },
    { target: editorRefForHotkey },
  )

  useHotkey(
    'Mod+K',
    () => {
      setLastHotkey('Mod+K')
      setEditorShortcutCount((c) => c + 1)
      setEditorContent('')
    },
    {
      target: editorRefForHotkey,
      stopPropagation: true, // prevent the event from bubbling up to the parent elements
    },
  )

  return (
    <div className="app">
      <header>
        <h1>useHotkey</h1>
        <p>
          Register keyboard shortcuts with callback context containing the
          hotkey and parsed hotkey information.
        </p>
      </header>

      <main>
        <section className="demo-section">
          <h2>Basic Hotkey</h2>
          <p>
            Press <kbd>{formatForDisplay('Mod+S')}</kbd> to trigger
          </p>
          <div className="counter">Save triggered: {saveCount}x</div>
          <pre className="code-block">{`useHotkey(
  'Mod+S',
  (event, { hotkey, parsedHotkey }) => {
    event.preventDefault()
    console.log('Hotkey:', hotkey)
    console.log('Parsed:', parsedHotkey)
  },
  { preventDefault: true }
)`}</pre>
        </section>

        <section className="demo-section">
          <h2>With requireReset</h2>
          <p>
            Hold <kbd>{formatForDisplay('Mod+K')}</kbd> — only increments once
            until you release all keys
          </p>
          <div className="counter">Increment: {incrementCount}</div>
          <p className="hint">
            This prevents repeated triggering while holding the keys down.
            Release all keys to allow re-triggering.
          </p>
          <pre className="code-block">{`useHotkey(
  'Mod+K',
  (event, { hotkey }) => {
    setCount(c => c + 1)
  },
  { requireReset: true }
)`}</pre>
        </section>

        <section className="demo-section">
          <h2>Conditional Hotkey</h2>
          <p>
            <kbd>{formatForDisplay('Mod+E')}</kbd> is currently{' '}
            <strong>{enabled ? 'enabled' : 'disabled'}</strong>
          </p>
          <button onClick={() => setEnabled(!enabled)}>
            {enabled ? 'Disable' : 'Enable'} Hotkey
          </button>
          <pre className="code-block">{`const [enabled, setEnabled] = useState(true)

useHotkey(
  'Mod+E',
  (event, { hotkey }) => {
    alert('Triggered!')
  },
  { enabled }
)`}</pre>
        </section>

        <section className="demo-section">
          <h2>Number Key Combinations</h2>
          <p>Common for tab/section switching:</p>
          <div className="hotkey-grid">
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
            <div>
              <kbd>{formatForDisplay('Control+0')}</kbd> → Tab 0
            </div>
            <div>
              <kbd>{formatForDisplay('Alt+9')}</kbd> → Tab 9
            </div>
          </div>
          <div className="counter">Active Tab: {activeTab}</div>
          <pre className="code-block">{`useHotkey('Mod+1', () => setActiveTab(1))
useHotkey('Mod+2', () => setActiveTab(2))
useHotkey('Control+0', () => setActiveTab(0))
useHotkey('Alt+9', () => setActiveTab(9))`}</pre>
        </section>

        <section className="demo-section">
          <h2>Navigation Key Combinations</h2>
          <p>Selection and navigation shortcuts:</p>
          <div className="hotkey-grid">
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
          <div className="counter">
            Navigation triggered: {navigationCount}x
          </div>
          <pre className="code-block">{`useHotkey('Shift+ArrowUp', () => selectUp())
useHotkey('Alt+ArrowLeft', () => navigateBack())
useHotkey('Mod+Home', () => goToStart())
useHotkey('Control+PageUp', () => previousPage())`}</pre>
        </section>

        <section className="demo-section">
          <h2>Function Key Combinations</h2>
          <p>System and application shortcuts:</p>
          <div className="hotkey-grid">
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
          <div className="counter">
            Function keys triggered: {functionKeyCount}x
          </div>
          <pre className="code-block">{`useHotkey('Alt+F4', () => closeWindow())
useHotkey('Control+F5', () => hardRefresh())
useHotkey('Mod+F1', () => showHelp())
useHotkey('F12', () => openDevTools())`}</pre>
        </section>

        <section className="demo-section">
          <h2>Multi-Modifier Combinations</h2>
          <p>Complex shortcuts with multiple modifiers:</p>
          <div className="hotkey-grid">
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
          <div className="counter">
            Multi-modifier triggered: {multiModifierCount}x
          </div>
          <pre className="code-block">{`useHotkey('Mod+Shift+S', () => saveAs())
useHotkey('Mod+Shift+Z', () => redo())
useHotkey('Control+Alt+A', () => specialAction())
useHotkey('Control+Alt+Shift+X', () => complexAction())`}</pre>
        </section>

        <section className="demo-section">
          <h2>Editing Key Combinations</h2>
          <p>Text editing and form shortcuts:</p>
          <div className="hotkey-grid">
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
          <div className="counter">
            Editing keys triggered: {editingKeyCount}x
          </div>
          <pre className="code-block">{`useHotkey('Mod+Enter', () => submitForm())
useHotkey('Shift+Enter', () => insertNewline())
useHotkey('Mod+Backspace', () => deleteWord())
useHotkey('Control+Tab', () => nextTab())
useHotkey('Mod+Space', () => toggle())`}</pre>
        </section>

        {lastHotkey && (
          <div className="info-box">
            <strong>Last triggered:</strong> {formatForDisplay(lastHotkey)}
          </div>
        )}

        <p className="hint">
          Press <kbd>Escape</kbd> to reset all counters
        </p>

        {/* ==================================================================== */}
        {/* Scoped Keyboard Shortcuts Section */}
        {/* ==================================================================== */}
        <section className="demo-section scoped-section">
          <h2>Scoped Keyboard Shortcuts</h2>
          <p>
            Shortcuts can be scoped to specific DOM elements using the{' '}
            <code>target</code> option. This allows different shortcuts to work
            in different parts of your application.
          </p>

          <div className="scoped-grid">
            {/* Sidebar Example */}
            <div className="scoped-area" ref={sidebarRef} tabIndex={0}>
              <h3>Sidebar (Scoped Area)</h3>
              <p>Click here to focus, then try:</p>
              <div className="hotkey-list">
                <div>
                  <kbd>{formatForDisplay('Mod+B')}</kbd> — Trigger sidebar
                  action
                </div>
                <div>
                  <kbd>{formatForDisplay('Mod+N')}</kbd> — New item
                </div>
              </div>
              <div className="counter">
                Sidebar shortcuts: {sidebarShortcutCount}x
              </div>
              <p className="hint">
                These shortcuts only work when this sidebar area is focused or
                contains focus.
              </p>
            </div>

            {/* Modal Example */}
            <div className="scoped-area">
              <h3>Modal Dialog</h3>
              <button onClick={() => setModalOpen(true)}>Open Modal</button>
              {modalOpen && (
                <div
                  className="modal-overlay"
                  onClick={() => setModalOpen(false)}
                >
                  <div
                    className="modal-content"
                    ref={modalRef}
                    tabIndex={0}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h3>Modal Dialog (Scoped)</h3>
                    <p>Try these shortcuts while modal is open:</p>
                    <div className="hotkey-list">
                      <div>
                        <kbd>{formatForDisplay('Escape')}</kbd> — Close modal
                      </div>
                      <div>
                        <kbd>{formatForDisplay('Mod+Enter')}</kbd> — Submit
                      </div>
                    </div>
                    <div className="counter">
                      Modal shortcuts: {modalShortcutCount}x
                    </div>
                    <p className="hint">
                      These shortcuts only work when the modal is open and
                      focused. The Escape key here won't conflict with the
                      global Escape handler.
                    </p>
                    <button onClick={() => setModalOpen(false)}>Close</button>
                  </div>
                </div>
              )}
            </div>

            {/* Editor Example */}
            <div className="scoped-area">
              <h3>Text Editor (Scoped)</h3>
              <p>Focus the editor below and try:</p>
              <div className="hotkey-list">
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
                ref={editorRef}
                className="scoped-editor"
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                placeholder="Focus here and try the shortcuts above..."
                rows={8}
              />
              <div className="counter">
                Editor shortcuts: {editorShortcutCount}x
              </div>
              <p className="hint">
                These shortcuts only work when the editor is focused. Notice
                that <kbd>{formatForDisplay('Mod+S')}</kbd> here doesn't
                conflict with the global <kbd>{formatForDisplay('Mod+S')}</kbd>{' '}
                shortcut.
              </p>
            </div>
          </div>

          <pre className="code-block">{`// Scoped to a ref
const sidebarRef = useRef<HTMLDivElement>(null)

useHotkey(
  'Mod+B',
  () => {
    console.log('Sidebar shortcut!')
  },
  { target: sidebarRef }
)

// Scoped to a modal (only when open)
const modalRef = useRef<HTMLDivElement>(null)
const [isOpen, setIsOpen] = useState(false)

useHotkey(
  'Escape',
  () => setIsOpen(false),
  { target: modalRef, enabled: isOpen }
)

// Scoped to an editor
const editorRef = useRef<HTMLTextAreaElement>(null)

useHotkey(
  'Mod+S',
  () => saveEditorContent(),
  { target: editorRef }
)`}</pre>
        </section>
      </main>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
