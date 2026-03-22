<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import {
  HotkeysProvider,
  formatForDisplay,
  useHotkey,
} from '@tanstack/vue-hotkeys'
import { HotkeysDevtoolsPanel } from '@tanstack/vue-hotkeys-devtools'
import { nextTick, ref, watch } from 'vue'
import type { Hotkey } from '@tanstack/vue-hotkeys'

const lastHotkey = ref<Hotkey | null>(null)
const saveCount = ref(0)
const incrementCount = ref(0)
const enabled = ref(true)
const activeTab = ref(1)
const navigationCount = ref(0)
const functionKeyCount = ref(0)
const multiModifierCount = ref(0)
const editingKeyCount = ref(0)

const modalOpen = ref(false)
const editorContent = ref('')
const sidebarShortcutCount = ref(0)
const modalShortcutCount = ref(0)
const editorShortcutCount = ref(0)

const sidebarRef = ref<HTMLDivElement | null>(null)
const modalRef = ref<HTMLDivElement | null>(null)
const editorRef = ref<HTMLTextAreaElement | null>(null)
const plugins = [{ name: 'TanStack Hotkeys', component: HotkeysDevtoolsPanel }]

useHotkey('Mod+S', (_event, { hotkey, parsedHotkey }) => {
  lastHotkey.value = hotkey
  saveCount.value++
  console.log('Hotkey triggered:', hotkey)
  console.log('Parsed hotkey:', parsedHotkey)
})

useHotkey(
  'Mod+K',
  (_event, { hotkey }) => {
    lastHotkey.value = hotkey
    incrementCount.value++
  },
  { requireReset: true },
)

useHotkey(
  'Mod+E',
  (_event, { hotkey }) => {
    lastHotkey.value = hotkey
    alert('This hotkey can be toggled!')
  },
  { enabled },
)

useHotkey('Mod+1', () => {
  lastHotkey.value = 'Mod+1'
  activeTab.value = 1
})
useHotkey('Mod+2', () => {
  lastHotkey.value = 'Mod+2'
  activeTab.value = 2
})
useHotkey('Mod+3', () => {
  lastHotkey.value = 'Mod+3'
  activeTab.value = 3
})
useHotkey('Mod+4', () => {
  lastHotkey.value = 'Mod+4'
  activeTab.value = 4
})
useHotkey('Mod+5', () => {
  lastHotkey.value = 'Mod+5'
  activeTab.value = 5
})

useHotkey('Shift+ArrowUp', () => {
  lastHotkey.value = 'Shift+ArrowUp'
  navigationCount.value++
})
useHotkey('Shift+ArrowDown', () => {
  lastHotkey.value = 'Shift+ArrowDown'
  navigationCount.value++
})
useHotkey('Alt+ArrowLeft', () => {
  lastHotkey.value = 'Alt+ArrowLeft'
  navigationCount.value++
})
useHotkey('Alt+ArrowRight', () => {
  lastHotkey.value = 'Alt+ArrowRight'
  navigationCount.value++
})
useHotkey('Mod+Home', () => {
  lastHotkey.value = 'Mod+Home'
  navigationCount.value++
})
useHotkey('Mod+End', () => {
  lastHotkey.value = 'Mod+End'
  navigationCount.value++
})
useHotkey('Control+PageUp', () => {
  lastHotkey.value = 'Control+PageUp'
  navigationCount.value++
})
useHotkey('Control+PageDown', () => {
  lastHotkey.value = 'Control+PageDown'
  navigationCount.value++
})

useHotkey('Meta+F4', () => {
  lastHotkey.value = 'Alt+F4'
  functionKeyCount.value++
  alert('Alt+F4 pressed (normally closes window)')
})
useHotkey('Control+F5', () => {
  lastHotkey.value = 'Control+F5'
  functionKeyCount.value++
})
useHotkey('Mod+F1', () => {
  lastHotkey.value = 'Mod+F1'
  functionKeyCount.value++
})
useHotkey('Shift+F10', () => {
  lastHotkey.value = 'Shift+F10'
  functionKeyCount.value++
})

useHotkey('Mod+Shift+S', () => {
  lastHotkey.value = 'Mod+Shift+S'
  multiModifierCount.value++
})
useHotkey('Mod+Shift+Z', () => {
  lastHotkey.value = 'Mod+Shift+Z'
  multiModifierCount.value++
})
useHotkey({ key: 'A', ctrl: true, alt: true }, () => {
  lastHotkey.value = 'Control+Alt+A'
  multiModifierCount.value++
})
useHotkey('Control+Shift+N', () => {
  lastHotkey.value = 'Control+Shift+N'
  multiModifierCount.value++
})
useHotkey('Mod+Alt+T', () => {
  lastHotkey.value = 'Mod+Alt+T'
  multiModifierCount.value++
})
useHotkey('Control+Alt+Shift+X', () => {
  lastHotkey.value = 'Control+Alt+Shift+X'
  multiModifierCount.value++
})

useHotkey('Mod+Enter', () => {
  lastHotkey.value = 'Mod+Enter'
  editingKeyCount.value++
})
useHotkey('Shift+Enter', () => {
  lastHotkey.value = 'Shift+Enter'
  editingKeyCount.value++
})
useHotkey('Mod+Backspace', () => {
  lastHotkey.value = 'Mod+Backspace'
  editingKeyCount.value++
})
useHotkey('Mod+Delete', () => {
  lastHotkey.value = 'Mod+Delete'
  editingKeyCount.value++
})
useHotkey('Control+Tab', () => {
  lastHotkey.value = 'Control+Tab'
  editingKeyCount.value++
})
useHotkey('Shift+Tab', () => {
  lastHotkey.value = 'Shift+Tab'
  editingKeyCount.value++
})
useHotkey('Mod+Space', () => {
  lastHotkey.value = 'Mod+Space'
  editingKeyCount.value++
})

useHotkey({ key: 'Escape' }, () => {
  lastHotkey.value = null
  saveCount.value = 0
  incrementCount.value = 0
  navigationCount.value = 0
  functionKeyCount.value = 0
  multiModifierCount.value = 0
  editingKeyCount.value = 0
  activeTab.value = 1
})

useHotkey('F12', () => {
  lastHotkey.value = 'F12'
  functionKeyCount.value++
})

watch(modalOpen, async (isOpen) => {
  if (isOpen) {
    await nextTick()
    modalRef.value?.focus()
  }
})

useHotkey(
  'Mod+B',
  () => {
    lastHotkey.value = 'Mod+B'
    sidebarShortcutCount.value++
    alert(
      'Sidebar shortcut triggered! This only works when the sidebar area is focused.',
    )
  },
  { target: sidebarRef },
)

useHotkey(
  'Mod+N',
  () => {
    lastHotkey.value = 'Mod+N'
    sidebarShortcutCount.value++
  },
  { target: sidebarRef },
)

useHotkey(
  'Escape',
  () => {
    lastHotkey.value = 'Escape'
    modalShortcutCount.value++
    modalOpen.value = false
  },
  { target: modalRef, enabled: modalOpen },
)

useHotkey(
  'Mod+Enter',
  () => {
    lastHotkey.value = 'Mod+Enter'
    modalShortcutCount.value++
    alert('Modal submit shortcut!')
  },
  { target: modalRef, enabled: modalOpen },
)

useHotkey(
  'Mod+S',
  () => {
    lastHotkey.value = 'Mod+S'
    editorShortcutCount.value++
    alert(
      `Editor content saved: "${editorContent.value.substring(0, 50)}${editorContent.value.length > 50 ? '...' : ''}"`,
    )
  },
  { target: editorRef },
)

useHotkey(
  'Mod+/',
  () => {
    lastHotkey.value = 'Mod+/'
    editorShortcutCount.value++
    editorContent.value += '\n// Comment added via shortcut'
  },
  { target: editorRef },
)

useHotkey(
  'Mod+K',
  () => {
    lastHotkey.value = 'Mod+K'
    editorShortcutCount.value++
    editorContent.value = ''
  },
  { target: editorRef },
)

const basicCode = `useHotkey('Mod+S', (_event, { hotkey, parsedHotkey }) => {
  console.log('Hotkey:', hotkey)
  console.log('Parsed:', parsedHotkey)
})`

const requireResetCode = `useHotkey(
  'Mod+K',
  (event, { hotkey }) => {
    setCount(c => c + 1)
  },
  { requireReset: true }
)`

const conditionalCode = `const [enabled, setEnabled] = useState(true)

useHotkey(
  'Mod+E',
  (event, { hotkey }) => {
    alert('Triggered!')
  },
  { enabled }
)`

const numberCode = `useHotkey('Mod+1', () => setActiveTab(1))
useHotkey('Mod+2', () => setActiveTab(2))`

const navigationCode = `useHotkey('Shift+ArrowUp', () => selectUp())
useHotkey('Alt+ArrowLeft', () => navigateBack())
useHotkey('Mod+Home', () => goToStart())
useHotkey('Control+PageUp', () => previousPage())`

const functionCode = `useHotkey('Alt+F4', () => closeWindow())
useHotkey('Control+F5', () => hardRefresh())
useHotkey('Mod+F1', () => showHelp())
useHotkey('F12', () => openDevTools())`

const multiModifierCode = `useHotkey('Mod+Shift+S', () => saveAs())
useHotkey('Mod+Shift+Z', () => redo())
useHotkey('Control+Alt+A', () => specialAction())
useHotkey('Control+Alt+Shift+X', () => complexAction())`

const editingCode = `useHotkey('Mod+Enter', () => submitForm())
useHotkey('Shift+Enter', () => insertNewline())
useHotkey('Mod+Backspace', () => deleteWord())
useHotkey('Control+Tab', () => nextTab())
useHotkey('Mod+Space', () => toggle())`

const scopedCode = `// Scoped to a ref
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
)`
</script>

<template>
  <HotkeysProvider>
    <div class="app">
      <header>
        <h1>useHotkey</h1>
        <p>
          Register keyboard shortcuts with callback context containing the
          hotkey and parsed hotkey information.
        </p>
      </header>

      <main>
        <section class="demo-section">
          <h2>Basic Hotkey</h2>
          <p>
            Press <kbd>{{ formatForDisplay('Mod+S') }}</kbd> to trigger
          </p>
          <div class="counter">Save triggered: {{ saveCount }}x</div>
          <pre class="code-block">{{ basicCode }}</pre>
        </section>

        <section class="demo-section">
          <h2>With requireReset</h2>
          <p>
            Hold <kbd>{{ formatForDisplay('Mod+K') }}</kbd> — only increments
            once until you release all keys
          </p>
          <div class="counter">Increment: {{ incrementCount }}</div>
          <p class="hint">
            This prevents repeated triggering while holding the keys down.
            Release all keys to allow re-triggering.
          </p>
          <pre class="code-block">{{ requireResetCode }}</pre>
        </section>

        <section class="demo-section">
          <h2>Conditional Hotkey</h2>
          <p>
            <kbd>{{ formatForDisplay('Mod+E') }}</kbd> is currently
            <strong> {{ enabled ? 'enabled' : 'disabled' }}</strong>
          </p>
          <button @click="enabled = !enabled">
            {{ enabled ? 'Disable' : 'Enable' }} Hotkey
          </button>
          <pre class="code-block">{{ conditionalCode }}</pre>
        </section>

        <section class="demo-section">
          <h2>Number Key Combinations</h2>
          <p>Common for tab/section switching:</p>
          <div class="hotkey-grid">
            <div>
              <kbd>{{ formatForDisplay('Mod+1') }}</kbd> → Tab 1
            </div>
            <div>
              <kbd>{{ formatForDisplay('Mod+2') }}</kbd> → Tab 2
            </div>
            <div>
              <kbd>{{ formatForDisplay('Mod+3') }}</kbd> → Tab 3
            </div>
            <div>
              <kbd>{{ formatForDisplay('Mod+4') }}</kbd> → Tab 4
            </div>
            <div>
              <kbd>{{ formatForDisplay('Mod+5') }}</kbd> → Tab 5
            </div>
          </div>
          <div class="counter">Active Tab: {{ activeTab }}</div>
          <pre class="code-block">{{ numberCode }}</pre>
        </section>

        <section class="demo-section">
          <h2>Navigation Key Combinations</h2>
          <p>Selection and navigation shortcuts:</p>
          <div class="hotkey-grid">
            <div>
              <kbd>{{ formatForDisplay('Shift+ArrowUp') }}</kbd> — Select up
            </div>
            <div>
              <kbd>{{ formatForDisplay('Shift+ArrowDown') }}</kbd> — Select down
            </div>
            <div>
              <kbd>{{ formatForDisplay('Alt+ArrowLeft') }}</kbd> — Navigate back
            </div>
            <div>
              <kbd>{{ formatForDisplay('Alt+ArrowRight') }}</kbd> — Navigate
              forward
            </div>
            <div>
              <kbd>{{ formatForDisplay('Mod+Home') }}</kbd> — Go to start
            </div>
            <div>
              <kbd>{{ formatForDisplay('Mod+End') }}</kbd> — Go to end
            </div>
            <div>
              <kbd>{{ formatForDisplay('Control+PageUp') }}</kbd> — Previous
              page
            </div>
            <div>
              <kbd>{{ formatForDisplay('Control+PageDown') }}</kbd> — Next page
            </div>
          </div>
          <div class="counter">
            Navigation triggered: {{ navigationCount }}x
          </div>
          <pre class="code-block">{{ navigationCode }}</pre>
        </section>

        <section class="demo-section">
          <h2>Function Key Combinations</h2>
          <p>System and application shortcuts:</p>
          <div class="hotkey-grid">
            <div>
              <kbd>{{ formatForDisplay('Alt+F4') }}</kbd> — Close window
            </div>
            <div>
              <kbd>{{ formatForDisplay('Control+F5') }}</kbd> — Hard refresh
            </div>
            <div>
              <kbd>{{ formatForDisplay('Mod+F1') }}</kbd> — Help
            </div>
            <div>
              <kbd>{{ formatForDisplay('Shift+F10') }}</kbd> — Context menu
            </div>
            <div>
              <kbd>{{ formatForDisplay('F12') }}</kbd> — DevTools
            </div>
          </div>
          <div class="counter">
            Function keys triggered: {{ functionKeyCount }}x
          </div>
          <pre class="code-block">{{ functionCode }}</pre>
        </section>

        <section class="demo-section">
          <h2>Multi-Modifier Combinations</h2>
          <p>Complex shortcuts with multiple modifiers:</p>
          <div class="hotkey-grid">
            <div>
              <kbd>{{ formatForDisplay('Mod+Shift+S') }}</kbd> — Save As
            </div>
            <div>
              <kbd>{{ formatForDisplay('Mod+Shift+Z') }}</kbd> — Redo
            </div>
            <div>
              <kbd>{{ formatForDisplay('Control+Alt+A') }}</kbd> — Special
              action
            </div>
            <div>
              <kbd>{{ formatForDisplay('Control+Shift+N') }}</kbd> — New
              incognito
            </div>
            <div>
              <kbd>{{ formatForDisplay('Mod+Alt+T') }}</kbd> — Toggle theme
            </div>
            <div>
              <kbd>{{ formatForDisplay('Control+Alt+Shift+X') }}</kbd> — Triple
              modifier
            </div>
          </div>
          <div class="counter">
            Multi-modifier triggered: {{ multiModifierCount }}x
          </div>
          <pre class="code-block">{{ multiModifierCode }}</pre>
        </section>

        <section class="demo-section">
          <h2>Editing Key Combinations</h2>
          <p>Text editing and form shortcuts:</p>
          <div class="hotkey-grid">
            <div>
              <kbd>{{ formatForDisplay('Mod+Enter') }}</kbd> — Submit form
            </div>
            <div>
              <kbd>{{ formatForDisplay('Shift+Enter') }}</kbd> — New line
            </div>
            <div>
              <kbd>{{ formatForDisplay('Mod+Backspace') }}</kbd> — Delete word
            </div>
            <div>
              <kbd>{{ formatForDisplay('Mod+Delete') }}</kbd> — Delete forward
            </div>
            <div>
              <kbd>{{ formatForDisplay('Control+Tab') }}</kbd> — Next tab
            </div>
            <div>
              <kbd>{{ formatForDisplay('Shift+Tab') }}</kbd> — Previous field
            </div>
            <div>
              <kbd>{{ formatForDisplay('Mod+Space') }}</kbd> — Toggle
            </div>
          </div>
          <div class="counter">
            Editing keys triggered: {{ editingKeyCount }}x
          </div>
          <pre class="code-block">{{ editingCode }}</pre>
        </section>

        <div v-if="lastHotkey" class="info-box">
          <strong>Last triggered:</strong> {{ formatForDisplay(lastHotkey) }}
        </div>

        <p class="hint">Press <kbd>Escape</kbd> to reset all counters</p>

        <section class="demo-section scoped-section">
          <h2>Scoped Keyboard Shortcuts</h2>
          <p>
            Shortcuts can be scoped to specific DOM elements using the
            <code>target</code> option. This allows different shortcuts to work
            in different parts of your application.
          </p>

          <div class="scoped-grid">
            <div ref="sidebarRef" class="scoped-area" tabindex="0">
              <h3>Sidebar (Scoped Area)</h3>
              <p>Click here to focus, then try:</p>
              <div class="hotkey-list">
                <div>
                  <kbd>{{ formatForDisplay('Mod+B') }}</kbd> — Trigger sidebar
                  action
                </div>
                <div>
                  <kbd>{{ formatForDisplay('Mod+N') }}</kbd> — New item
                </div>
              </div>
              <div class="counter">
                Sidebar shortcuts: {{ sidebarShortcutCount }}x
              </div>
              <p class="hint">
                These shortcuts only work when this sidebar area is focused or
                contains focus.
              </p>
            </div>

            <div class="scoped-area">
              <h3>Modal Dialog</h3>
              <button @click="modalOpen = true">Open Modal</button>
              <div
                v-if="modalOpen"
                class="modal-overlay"
                @click="modalOpen = false"
              >
                <div
                  ref="modalRef"
                  class="modal-content"
                  tabindex="0"
                  @click.stop
                >
                  <h3>Modal Dialog (Scoped)</h3>
                  <p>Try these shortcuts while modal is open:</p>
                  <div class="hotkey-list">
                    <div>
                      <kbd>{{ formatForDisplay('Escape') }}</kbd> — Close modal
                    </div>
                    <div>
                      <kbd>{{ formatForDisplay('Mod+Enter') }}</kbd> — Submit
                    </div>
                  </div>
                  <div class="counter">
                    Modal shortcuts: {{ modalShortcutCount }}x
                  </div>
                  <p class="hint">
                    These shortcuts only work when the modal is open and
                    focused. The Escape key here won't conflict with the global
                    Escape handler.
                  </p>
                  <button @click="modalOpen = false">Close</button>
                </div>
              </div>
            </div>

            <div class="scoped-area">
              <h3>Text Editor (Scoped)</h3>
              <p>Focus the editor below and try:</p>
              <div class="hotkey-list">
                <div>
                  <kbd>{{ formatForDisplay('Mod+S') }}</kbd> — Save editor
                  content
                </div>
                <div>
                  <kbd>{{ formatForDisplay('Mod+/') }}</kbd> — Add comment
                </div>
                <div>
                  <kbd>{{ formatForDisplay('Mod+K') }}</kbd> — Clear editor
                </div>
              </div>
              <textarea
                ref="editorRef"
                v-model="editorContent"
                class="scoped-editor"
                placeholder="Focus here and try the shortcuts above..."
                rows="8"
              />
              <div class="counter">
                Editor shortcuts: {{ editorShortcutCount }}x
              </div>
              <p class="hint">
                These shortcuts only work when the editor is focused. Notice
                that
                <kbd>{{ formatForDisplay('Mod+S') }}</kbd> here doesn't conflict
                with the global <kbd>{{ formatForDisplay('Mod+S') }}</kbd>
                shortcut.
              </p>
            </div>
          </div>

          <pre class="code-block">{{ scopedCode }}</pre>
        </section>
      </main>

      <TanStackDevtools :plugins="plugins" />
    </div>
  </HotkeysProvider>
</template>
