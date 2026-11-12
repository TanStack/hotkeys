// @vitest-environment node

// The shim defines `document`, as apps that render Lit in Node often load it.
import '@lit-labs/ssr/lib/install-global-dom-shim.js'
import { LitElementRenderer, render } from '@lit-labs/ssr'
import { collectResultSync } from '@lit-labs/ssr/lib/render-result.js'
import {
  formatForDisplay,
  getHotkeyManager,
  getKeyStateTracker,
  getKeyboardLayoutStore,
} from '@tanstack/hotkeys'
import { LitElement, html } from 'lit'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  AppHotkeysController,
  HeldKeyCodesController,
  HeldKeysController,
  HotkeyController,
  HotkeyHintController,
  HotkeyRecorderController,
  HotkeyRegistrationsController,
  HotkeyScopesStateController,
  KeyHoldController,
  KeyboardLayoutController,
} from '../src/controllers'
import { hotkey } from '../src/decorators'

/** Counts the live subscribers on a store from now on. */
function countSubscribers(store: {
  subscribe: (listener: never) => { unsubscribe: () => void }
}): () => number {
  const subscribe = store.subscribe.bind(store)
  let live = 0
  store.subscribe = (listener) => {
    live++
    const subscription = subscribe(listener)
    let active = true
    return {
      unsubscribe: () => {
        if (active) live--
        active = false
        subscription.unsubscribe()
      },
    }
  }
  return () => live
}

class ServerElement extends LitElement {
  app = new AppHotkeysController(this)
  codes = new HeldKeyCodesController(this)
  keys = new HeldKeysController(this)
  save = new HotkeyController(this, 'Mod+K', () => {})
  hint = new HotkeyHintController(this, 'Mod+K')
  recorder = new HotkeyRecorderController(this, { onRecord: () => {} })
  registrations = new HotkeyRegistrationsController(this)
  scopes = new HotkeyScopesStateController(this)
  shift = new KeyHoldController(this, 'Shift')
  layout = new KeyboardLayoutController(this)

  print() {}

  override render() {
    const layoutMap = this.layout.value ?? undefined
    return html`<p>Server</p>
      <kbd
        >${formatForDisplay('Mod+[KeyQ]', {
          platform: 'windows',
          layoutMap,
        })}</kbd
      >`
  }
}
// `@hotkey('Mod+P') print() {}`, applied by hand: test files aren't compiled
// with decorators.
hotkey('Mod+P')(ServerElement.prototype, 'print')
customElements.define('server-element', ServerElement)

// With this option, the server calls connectedCallback and never
// disconnectedCallback.
const connect = () => ({ connectedCallback: true })

describe('server rendering with the @lit-labs/ssr DOM shim', () => {
  beforeAll(() => {
    LitElementRenderer.renderOptions.push(connect)
  })
  afterAll(() => {
    const options = LitElementRenderer.renderOptions
    options.splice(options.indexOf(connect), 1)
  })

  it('has a document', () => {
    expect(typeof document).toBe('object')
  })

  it('registers no hotkey and subscribes to no store', () => {
    const manager = getHotkeyManager()
    const counts = [
      getKeyStateTracker().store,
      manager.registrations,
      manager.scopes,
      manager.appHotkeys,
      getKeyboardLayoutStore(),
    ].map(countSubscribers)

    let markup = ''
    for (let i = 0; i < 100; i++) {
      markup = collectResultSync(
        render(html`<server-element></server-element>`),
      )
    }

    expect(markup).toContain('<p>Server</p>')
    expect(manager.registrations.state.size).toBe(0)
    expect(counts.map((count) => count())).toEqual([0, 0, 0, 0, 0])
  })

  it('renders a physical key with its conventional label', () => {
    // A layout can only be in the store on a server if the app put it there.
    const store = getKeyboardLayoutStore()
    store.setState(() => new Map([['KeyQ', 'a']]))
    const markup = collectResultSync(
      render(html`<server-element></server-element>`),
    )
    store.setState(() => null)
    expect(markup).toContain('Ctrl+Q')
    expect(markup).not.toContain('Ctrl+A')
  })
})
