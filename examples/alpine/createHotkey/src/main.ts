import Alpine from 'alpinejs'
import { createHotkeysScope, formatForDisplay } from '@tanstack/alpine-hotkeys'
import './index.css'
import type { Hotkey } from '@tanstack/alpine-hotkeys'

class App {
  private hotkeysScope = createHotkeysScope()

  formatForDisplay = formatForDisplay
  usage0 =
    "scope.createHotkey('Mod+[KeyS]', (_event, { hotkey, parsedHotkey }) => {\n  console.log(hotkey, parsedHotkey)\n})"
  usage1 =
    "scope.createHotkey('Mod+K', () => this.count++, { requireReset: true })"
  usage2 =
    "scope.createHotkey(\n  'Mod+E',\n  () => alert('Triggered!'),\n  () => ({ enabled: this.enabled }),\n)"
  usage3 =
    "scope.createHotkey('Mod+1', () => { this.activeTab = 1 })\nscope.createHotkey('Mod+[Digit2]', () => { this.activeTab = 2 })"
  usage4 =
    "scope.createHotkey('Shift+ArrowUp', selectUp)\nscope.createHotkey('Alt+ArrowLeft', navigateBack)\nscope.createHotkey('Mod+Home', goToStart)\nscope.createHotkey('Control+PageUp', previousPage)"
  usage5 =
    "scope.createHotkey('Alt+F4', closeWindow)\nscope.createHotkey('Control+F5', hardRefresh)\nscope.createHotkey('Mod+F1', showHelp)\nscope.createHotkey('F12', openDevTools)"
  usage6 =
    "scope.createHotkey('Mod+Shift+S', saveAs)\nscope.createHotkey('Control+Alt+Shift+X', runAdvancedAction)"
  usage7 =
    "scope.createHotkey('Mod+Enter', submitForm)\nscope.createHotkey('Mod+Backspace', deleteWord)\nscope.createHotkey('Mod+Space', openPalette)"
  usage8 =
    "scope.createHotkey('Mod+B', sidebarAction,\n  () => ({ target: this.sidebarRef.current }))\nscope.createHotkey('Escape', closeModal,\n  () => ({ target: this.modalRef.current, enabled: this.modalOpen }))\nscope.createHotkey('Mod+S', saveEditor,\n  () => ({ target: this.editorRef.current }))"
  lastHotkey: Hotkey | null = null
  saveCount = 0
  incrementCount = 0
  enabled = true
  activeTab = 1
  navigationCount = 0
  functionKeyCount = 0
  multiModifierCount = 0
  editingKeyCount = 0
  modalOpen = false
  editorContent = ''
  sidebarShortcutCount = 0
  modalShortcutCount = 0
  editorShortcutCount = 0
  sidebarRef = { current: null as HTMLDivElement | null }
  modalRef = { current: null as HTMLDivElement | null }
  editorRef = { current: null as HTMLTextAreaElement | null }
  get editorRefForHotkey() {
    return this.editorRef
  }

  init() {
    this.hotkeysScope.createHotkey(
      () => 'Mod+[KeyS]',
      (_event, { hotkey, parsedHotkey }) => {
        this.lastHotkey = hotkey
        this.saveCount = this.saveCount + 1
        console.log('Hotkey triggered:', hotkey)
        console.log('Parsed hotkey:', parsedHotkey)
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+K',
      (_event, { hotkey }) => {
        this.lastHotkey = hotkey
        this.incrementCount = this.incrementCount + 1
      },
      () => ({ requireReset: true }),
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+E',
      (_event, { hotkey }) => {
        this.lastHotkey = hotkey
        alert('This hotkey can be toggled!')
      },
      () => ({ enabled: this.enabled }),
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+1',
      () => {
        this.lastHotkey = 'Mod+1'
        this.activeTab = 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+[Digit2]',
      () => {
        this.lastHotkey = 'Mod+[Digit2]'
        this.activeTab = 2
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+3',
      () => {
        this.lastHotkey = 'Mod+3'
        this.activeTab = 3
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+4',
      () => {
        this.lastHotkey = 'Mod+4'
        this.activeTab = 4
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+5',
      () => {
        this.lastHotkey = 'Mod+5'
        this.activeTab = 5
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Shift+ArrowUp',
      () => {
        this.lastHotkey = 'Shift+ArrowUp'
        this.navigationCount = this.navigationCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Shift+ArrowDown',
      () => {
        this.lastHotkey = 'Shift+ArrowDown'
        this.navigationCount = this.navigationCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Alt+ArrowLeft',
      () => {
        this.lastHotkey = 'Alt+ArrowLeft'
        this.navigationCount = this.navigationCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Alt+ArrowRight',
      () => {
        this.lastHotkey = 'Alt+ArrowRight'
        this.navigationCount = this.navigationCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+Home',
      () => {
        this.lastHotkey = 'Mod+Home'
        this.navigationCount = this.navigationCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+End',
      () => {
        this.lastHotkey = 'Mod+End'
        this.navigationCount = this.navigationCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Control+PageUp',
      () => {
        this.lastHotkey = 'Control+PageUp'
        this.navigationCount = this.navigationCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Control+PageDown',
      () => {
        this.lastHotkey = 'Control+PageDown'
        this.navigationCount = this.navigationCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Alt+F4',
      () => {
        this.lastHotkey = 'Alt+F4'
        this.functionKeyCount = this.functionKeyCount + 1
        alert('Alt+F4 pressed (normally closes window)')
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Control+F5',
      () => {
        this.lastHotkey = 'Control+F5'
        this.functionKeyCount = this.functionKeyCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+F1',
      () => {
        this.lastHotkey = 'Mod+F1'
        this.functionKeyCount = this.functionKeyCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Shift+F10',
      () => {
        this.lastHotkey = 'Shift+F10'
        this.functionKeyCount = this.functionKeyCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+Shift+S',
      () => {
        this.lastHotkey = 'Mod+Shift+S'
        this.multiModifierCount = this.multiModifierCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+Shift+Z',
      () => {
        this.lastHotkey = 'Mod+Shift+Z'
        this.multiModifierCount = this.multiModifierCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => ({ key: 'A', ctrl: true, alt: true }),
      () => {
        this.lastHotkey = 'Control+Alt+A'
        this.multiModifierCount = this.multiModifierCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Control+Shift+N',
      () => {
        this.lastHotkey = 'Control+Shift+N'
        this.multiModifierCount = this.multiModifierCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+Alt+T',
      () => {
        this.lastHotkey = 'Mod+Alt+T'
        this.multiModifierCount = this.multiModifierCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Control+Alt+Shift+X',
      () => {
        this.lastHotkey = 'Control+Alt+Shift+X'
        this.multiModifierCount = this.multiModifierCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+Enter',
      () => {
        this.lastHotkey = 'Mod+Enter'
        this.editingKeyCount = this.editingKeyCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Shift+Enter',
      () => {
        this.lastHotkey = 'Shift+Enter'
        this.editingKeyCount = this.editingKeyCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+Backspace',
      () => {
        this.lastHotkey = 'Mod+Backspace'
        this.editingKeyCount = this.editingKeyCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+Delete',
      () => {
        this.lastHotkey = 'Mod+Delete'
        this.editingKeyCount = this.editingKeyCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Control+Tab',
      () => {
        this.lastHotkey = 'Control+Tab'
        this.editingKeyCount = this.editingKeyCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Shift+Tab',
      () => {
        this.lastHotkey = 'Shift+Tab'
        this.editingKeyCount = this.editingKeyCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+Space',
      () => {
        this.lastHotkey = 'Mod+Space'
        this.editingKeyCount = this.editingKeyCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => ({ key: 'Escape' }),
      () => {
        this.lastHotkey = null
        this.saveCount = 0
        this.incrementCount = 0
        this.navigationCount = 0
        this.functionKeyCount = 0
        this.multiModifierCount = 0
        this.editingKeyCount = 0
        this.activeTab = 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'F12',
      () => {
        this.lastHotkey = 'F12'
        this.functionKeyCount = this.functionKeyCount + 1
      },
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+B',
      () => {
        this.lastHotkey = 'Mod+B'
        this.sidebarShortcutCount = this.sidebarShortcutCount + 1
        alert(
          'Sidebar shortcut triggered! This only works when the sidebar area is focused.',
        )
      },
      () => ({ target: this.sidebarRef.current }),
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+N',
      () => {
        this.lastHotkey = 'Mod+N'
        this.sidebarShortcutCount = this.sidebarShortcutCount + 1
      },
      () => ({ target: this.sidebarRef.current }),
    )
    this.hotkeysScope.createHotkey(
      () => 'Escape',
      () => {
        this.lastHotkey = 'Escape'
        this.modalShortcutCount = this.modalShortcutCount + 1
        this.modalOpen = false
      },
      () => ({ target: this.modalRef.current, enabled: this.modalOpen }),
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+Enter',
      () => {
        this.lastHotkey = 'Mod+Enter'
        this.modalShortcutCount = this.modalShortcutCount + 1
        alert('Modal submit shortcut!')
      },
      () => ({ target: this.modalRef.current, enabled: this.modalOpen }),
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+S',
      () => {
        this.lastHotkey = 'Mod+S'
        this.editorShortcutCount = this.editorShortcutCount + 1
        alert(
          `Editor content saved: "${this.editorContent.substring(0, 50)}${this.editorContent.length > 50 ? '...' : ''}"`,
        )
      },
      () => ({ target: this.editorRefForHotkey.current }),
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+/',
      () => {
        this.lastHotkey = 'Mod+/'
        this.editorShortcutCount = this.editorShortcutCount + 1
        this.editorContent =
          this.editorContent + '\n// Comment added via shortcut'
      },
      () => ({ target: this.editorRefForHotkey.current }),
    )
    this.hotkeysScope.createHotkey(
      () => 'Mod+K',
      () => {
        this.lastHotkey = 'Mod+K'
        this.editorShortcutCount = this.editorShortcutCount + 1
        this.editorContent = ''
      },
      () => ({ target: this.editorRefForHotkey.current }),
    )
    this.hotkeysScope.createHotkey(
      () => 'J',
      () => {
        this.lastHotkey = 'J'
        this.editorShortcutCount = this.editorShortcutCount + 1
      },
    )
  }
  destroy() {
    this.hotkeysScope.destroy()
  }
}
Alpine.data('app', () => new App())
Alpine.start()
