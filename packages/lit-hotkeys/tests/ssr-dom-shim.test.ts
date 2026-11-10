// @vitest-environment node

// The shim defines `document`, as apps that render Lit in Node often load it.
import '@lit-labs/ssr/lib/install-global-dom-shim.js'
import { LitElementRenderer, render } from '@lit-labs/ssr'
import { collectResultSync } from '@lit-labs/ssr/lib/render-result.js'
import { getHotkeyManager, getKeyStateTracker } from '@tanstack/hotkeys'
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

  print() {}

  override render() {
    return html`<p>Server</p>`
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
    ].map(countSubscribers)

    let markup = ''
    for (let i = 0; i < 100; i++) {
      markup = collectResultSync(
        render(html`<server-element></server-element>`),
      )
    }

    expect(markup).toContain('<p>Server</p>')
    expect(manager.registrations.state.size).toBe(0)
    expect(counts.map((count) => count())).toEqual([0, 0, 0, 0])
  })
})
