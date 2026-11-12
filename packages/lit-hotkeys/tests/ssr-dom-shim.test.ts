// @vitest-environment node

// The shim defines `document`, as apps that render Lit in Node often load it.
import '@lit-labs/ssr/lib/install-global-dom-shim.js'
import { LitElementRenderer, render } from '@lit-labs/ssr'
import { collectResultSync } from '@lit-labs/ssr/lib/render-result.js'
import {
  getHotkeyManager,
  getKeyStateTracker,
  getKeyboardLayoutStore,
} from '@tanstack/hotkeys'
import { LitElement, html } from 'lit'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  AppHotkeysController,
  FormatForDisplayController,
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
import type { HotkeyPlatform } from '@tanstack/hotkeys'

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
  static override properties = { platform: {} }
  declare platform?: HotkeyPlatform

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
  formatForDisplay = new FormatForDisplayController(this, () => ({
    platform: this.platform,
  }))

  print() {}

  override render() {
    const key = this.layout.value?.get('KeyQ') ?? 'q'
    return html`<p>Server</p>
      <kbd>${this.formatForDisplay.format('Mod+[KeyQ]')}</kbd>
      <kbd>${key}</kbd>`
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
        render(html`<server-element platform="windows"></server-element>`),
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
      render(html`<server-element platform="windows"></server-element>`),
    )
    store.setState(() => null)
    expect(markup).toContain('Ctrl+Q')
    expect(markup).not.toContain('Ctrl+A')
    expect(markup).toContain('<kbd><!--lit-part-->q<!--/lit-part--></kbd>')
  })

  it('formats labels on the platform from a host property', () => {
    const markup = (platform: HotkeyPlatform) =>
      collectResultSync(
        render(html`<server-element platform=${platform}></server-element>`),
      )
    expect(markup('mac')).toContain('⌘ Q')
    expect(markup('windows')).toContain('Ctrl+Q')
  })
})
