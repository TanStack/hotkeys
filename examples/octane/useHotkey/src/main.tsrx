import { createRoot, useLayoutEffect, useState } from 'octane'

import {
  HotkeysProvider,
  formatForDisplay,
  useHotkey,
} from '@tanstack/octane-hotkeys'

import type { Hotkey } from '@tanstack/octane-hotkeys'

import './index.css'

function App() @{
  const [lastHotkey, setLastHotkey] = useState<Hotkey | null>(null)
  const [saveCount, setSaveCount] = useState(0)
  const [incrementCount, setIncrementCount] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState(1)
  const [navigationCount, setNavigationCount] = useState(0)
  const [functionKeyCount, setFunctionKeyCount] = useState(0)
  const [multiModifierCount, setMultiModifierCount] = useState(0)
  const [editingKeyCount, setEditingKeyCount] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [editorContent, setEditorContent] = useState('')
  const [sidebarShortcutCount, setSidebarShortcutCount] = useState(0)
  const [modalShortcutCount, setModalShortcutCount] = useState(0)
  const [editorShortcutCount, setEditorShortcutCount] = useState(0)
  const [sidebarRef, setSidebarRef] = useState<HTMLDivElement | null>(null)
  const [modalRef, setModalRef] = useState<HTMLDivElement | null>(null)
  const [editorRef, setEditorRef] = useState<HTMLTextAreaElement | null>(null)
  useHotkey('Mod+[KeyS]', (_event, { hotkey, parsedHotkey }) => {
    setLastHotkey(hotkey)
    setSaveCount((c) => c + 1)
    console.log('Hotkey triggered:', hotkey)
    console.log('Parsed hotkey:', parsedHotkey)
  })
  useHotkey(
    'Mod+K',
    (_event, { hotkey }) => {
      setLastHotkey(hotkey)
      setIncrementCount((c) => c + 1)
    },
    { requireReset: true },
  )
  useHotkey(
    'Mod+E',
    (_event, { hotkey }) => {
      setLastHotkey(hotkey)
      alert('This hotkey can be toggled!')
    },
    { enabled },
  )
  useHotkey('Mod+1', () => {
    setLastHotkey('Mod+1')
    setActiveTab(1)
  })
  useHotkey('Mod+[Digit2]', () => {
    setLastHotkey('Mod+[Digit2]')
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
  useHotkey('Alt+F4', () => {
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
  useHotkey('Mod+Shift+S', () => {
    setLastHotkey('Mod+Shift+S')
    setMultiModifierCount((c) => c + 1)
  })
  useHotkey('Mod+Shift+Z', () => {
    setLastHotkey('Mod+Shift+Z')
    setMultiModifierCount((c) => c + 1)
  })
  useHotkey({ key: 'A', ctrl: true, alt: true }, () => {
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
  useHotkey({ key: 'Escape' }, () => {
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
  useLayoutEffect(() => {
    if (modalOpen) {
      modalRef?.focus()
    }
  }, [modalOpen, modalRef])
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
  useHotkey(
    'Mod+S',
    () => {
      setLastHotkey('Mod+S')
      setEditorShortcutCount((c) => c + 1)
      alert(
        `Editor content saved: "${editorContent.substring(0, 50)}${editorContent.length > 50 ? '...' : ''}"`,
      )
    },
    { target: editorRef },
  )
  useHotkey(
    'Mod+/',
    () => {
      setLastHotkey('Mod+/')
      setEditorShortcutCount((c) => c + 1)
      setEditorContent((prev) => prev + '\n// Comment added via shortcut')
    },
    { target: editorRef },
  )
  useHotkey(
    'Mod+K',
    () => {
      setLastHotkey('Mod+K')
      setEditorShortcutCount((c) => c + 1)
      setEditorContent('')
    },
    { target: editorRef },
  )
  useHotkey('J', () => {
    setLastHotkey('J')
    setEditorShortcutCount((c) => c + 1)
  })
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
              Press <kbd>{formatForDisplay('Mod+[KeyS]')}</kbd> to trigger the
              physical S position
            </p>
            <div className="counter">Save triggered: {saveCount}x</div>
            <pre className="code-block">{`useHotkey('Mod+[KeyS]', (_event, { hotkey, parsedHotkey }) => {
    console.log('Hotkey:', hotkey)
    console.log('Parsed:', parsedHotkey)
  })`}</pre>
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
            <p>
              Tab 2 uses the physical number-row position (
              <code>Mod+[Digit2]</code>), even when that key produces a different
              character. The other tabs follow logical digits.
            </p>
            <div className="hotkey-grid">
              <div>
                <kbd>{formatForDisplay('Mod+1')}</kbd> → Tab 1
              </div>
              <div>
                <kbd>{formatForDisplay('Mod+[Digit2]')}</kbd> → Tab 2
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
            <div className="counter">Active Tab: {activeTab}</div>
            <pre className="code-block">{`useHotkey('Mod+1', () => setActiveTab(1))
  useHotkey('Mod+[Digit2]', () => setActiveTab(2))
  `}</pre>
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

          @if (lastHotkey) { <div className="info-box">
              <strong>Last triggered:</strong> {formatForDisplay(lastHotkey)}
            </div> }

          <p className="hint">
            Press <kbd>Escape</kbd> to reset all counters
          </p>

          <section className="demo-section scoped-section">
            <h2>Scoped Keyboard Shortcuts</h2>
            <p>
              Shortcuts can be scoped to specific DOM elements using the{' '}
              <code>target</code> option. This allows different shortcuts to work
              in different parts of your application.
            </p>

            <div className="scoped-grid">

              <div className="scoped-area" ref={setSidebarRef} tabIndex={0}>
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

              <div className="scoped-area">
                <h3>Modal Dialog</h3>
                <button onClick={() => setModalOpen(true)}>Open Modal</button>
                @if (modalOpen) { <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal-content" ref={setModalRef} tabIndex={0} onClick={(e) => e.stopPropagation()}>
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
                  </div> }
              </div>

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
                  <div>
                    <kbd>J</kbd> — Single key (test ignoreInputs)
                  </div>
                </div>
                <textarea ref={setEditorRef} className="scoped-editor" value={editorContent} onInput={(e) => setEditorContent(e.currentTarget.value)} placeholder="Focus here and try the shortcuts above..." rows={8} />
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

            <pre className="code-block">{`// Capture the element through a state setter.
const [sidebar, setSidebar] = useState<HTMLDivElement | null>(null)

useHotkey('Mod+B', sidebarAction, { target: sidebar })

// In the component template:
<div ref={setSidebar} tabIndex={0}>Sidebar</div>

// Null targets wait until the element mounts.
useHotkey('Escape', closeModal, { target: modal, enabled: isOpen })
useHotkey('Mod+S', saveEditorContent, { target: editor })`}</pre>
          </section>
        </main>

      </div>
}

function Root() @{
<HotkeysProvider><App /></HotkeysProvider>
}

const root = createRoot(document.getElementById('root')!)
root.render(Root)
import.meta.hot?.dispose(() => root.unmount())
