import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import { hash } from '@ember/helper'
import { clearRender, render, settled, waitUntil } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import { module, test } from 'qunit'
import {
  createHotkeysScope, getKeyboardLayoutStore, useFormatForDisplay, useKeyboardLayout,
} from '@tanstack/ember-hotkeys'
import type { EmberHotkeysScope } from '@tanstack/ember-hotkeys'

const AZERTY = new Map([['KeyQ', 'a']])
// The French BÉPO layout types `b` on this key
const BEPO = new Map([['KeyQ', 'b']])
const CUSTOM = new Map([['KeyQ', 'x']])

let calls = 0

/** Stubs `navigator.keyboard`. Chrome defines it on the prototype, so an own property shadows it. */
function stubKeyboard(keyboard: unknown) {
  Object.defineProperty(navigator, 'keyboard', { value: keyboard, configurable: true })
}

/** Stubs `navigator.keyboard.getLayoutMap` and counts its calls. */
function stubLayout(result: () => Promise<Map<string, string>>) {
  stubKeyboard({ getLayoutMap: () => { calls++; return result() } })
}

const layoutKey = () => getKeyboardLayoutStore().state?.get('KeyQ')
const text = (id: string) => document.getElementById(id)?.textContent?.trim()
const texts = (selector: string) =>
  [...document.querySelectorAll(selector)].map((element) => element.textContent?.trim())

/** Waits for the browser's answer to reach the store, then for the render. */
async function loaded(key: string) {
  await waitUntil(() => layoutKey() === key)
  await settled()
}

const windows = createHotkeysScope({ platform: 'windows' })
const off = createHotkeysScope({ platform: 'windows', keyboardLayout: false })

class Settings {
  @tracked keyboardLayout = false
}

/** Every label and layout entry rendered, in order. */
const labels: Array<string> = []
const entries: Array<string | undefined> = []

interface ScopeSignature {
  Args: { hotkeys?: EmberHotkeysScope }
}

/** A label, as an app draws one: nothing but `useFormatForDisplay`. */
class Label extends Component<ScopeSignature> {
  format = useFormatForDisplay(this.args.hotkeys)
  custom = CUSTOM
  get label() {
    const label = this.format('Mod+[KeyQ]')
    labels.push(label)
    return label
  }
  <template>
    <kbd class="label">{{this.label}}</kbd>
    <kbd class="custom">{{this.format "[KeyQ]" (hash layoutMap=this.custom)}}</kbd>
  </template>
}

/** Reads the layout, and keeps it current while it is rendered. */
class Reader extends Component<ScopeSignature> {
  layout = useKeyboardLayout(this, this.args.hotkeys)
  get entry() {
    const entry = this.layout.value?.get('KeyQ')
    entries.push(entry)
    return entry
  }
  <template><output id="entry">{{this.entry}}</output></template>
}

module('Keyboard layout labels', (hooks) => {
  setupRenderingTest(hooks)
  hooks.beforeEach(() => {
    calls = 0
    labels.length = 0
    entries.length = 0
  })
  hooks.afterEach(async () => {
    await clearRender()
    // The layout outlives the components that loaded it
    getKeyboardLayoutStore().setState(() => null)
    stubKeyboard(undefined)
  })

  test('labels a physical key with what it types once the layout loads', async (assert) => {
    let answer!: (layout: Map<string, string>) => void
    stubLayout(() => new Promise((resolve) => { answer = resolve }))
    await render(<template><Label @hotkeys={{windows}} /></template>)
    assert.deepEqual(texts('.label'), ['Ctrl+Q'])
    assert.strictEqual(calls, 1)

    answer(AZERTY)
    await loaded('a')
    assert.deepEqual(texts('.label'), ['Ctrl+A'])
    assert.deepEqual(labels, ['Ctrl+Q', 'Ctrl+A'])
    assert.strictEqual(calls, 1)
  })

  test('loads the layout without a scope', async (assert) => {
    stubLayout(() => Promise.resolve(AZERTY))
    const format = useFormatForDisplay()
    await render(<template><kbd id="plain">{{format "[KeyQ]"}}</kbd></template>)
    await loaded('a')
    assert.strictEqual(text('plain'), 'A')
  })

  test('reads the layout once for many labels', async (assert) => {
    stubLayout(() => Promise.resolve(AZERTY))
    await render(<template>
      <Label @hotkeys={{windows}} />
      <Label @hotkeys={{windows}} />
      <Label @hotkeys={{windows}} />
      <Reader />
    </template>)
    await loaded('a')
    assert.deepEqual(texts('.label'), ['Ctrl+A', 'Ctrl+A', 'Ctrl+A'])
    assert.strictEqual(text('entry'), 'a')
    assert.strictEqual(calls, 1)
  })

  test('never asks the browser when keyboardLayout is false', async (assert) => {
    stubLayout(() => Promise.resolve(AZERTY))
    // Another part of the page may have loaded the layout already
    getKeyboardLayoutStore().setState(() => AZERTY)
    await render(<template><Label @hotkeys={{off}} /><Reader @hotkeys={{off}} /></template>)
    window.dispatchEvent(new Event('focus'))
    await settled()
    assert.strictEqual(calls, 0)
    assert.deepEqual(texts('.label'), ['Ctrl+Q'])
    assert.deepEqual(labels, ['Ctrl+Q'])
    assert.strictEqual(text('entry'), '')
    assert.deepEqual(entries, [undefined])
  })

  test('follows scope defaults that turn the layout on and off', async (assert) => {
    stubLayout(() => Promise.resolve(AZERTY))
    const settings = new Settings()
    const scope = createHotkeysScope(() => ({
      platform: 'windows' as const, keyboardLayout: settings.keyboardLayout,
    }))
    await render(<template><Label @hotkeys={{scope}} /><Reader @hotkeys={{scope}} /></template>)
    assert.strictEqual(calls, 0)
    assert.deepEqual(texts('.label'), ['Ctrl+Q'])

    settings.keyboardLayout = true
    await loaded('a')
    assert.strictEqual(calls, 1)
    assert.deepEqual(texts('.label'), ['Ctrl+A'])
    assert.strictEqual(text('entry'), 'a')

    settings.keyboardLayout = false
    await settled()
    assert.deepEqual(texts('.label'), ['Ctrl+Q'])
    assert.strictEqual(text('entry'), '')
    window.dispatchEvent(new Event('focus'))
    assert.strictEqual(calls, 1)
  })

  test('shows the loaded layout at once to a label that mounts later', async (assert) => {
    let layout: Promise<Map<string, string>> = Promise.resolve(AZERTY)
    stubLayout(() => layout)
    await render(<template><Label @hotkeys={{windows}} /></template>)
    await loaded('a')
    await clearRender()
    labels.length = 0

    // Such as a tooltip that opens again. The browser doesn't answer this time.
    layout = new Promise(() => {})
    await render(<template><Label @hotkeys={{windows}} /></template>)
    assert.deepEqual(texts('.label'), ['Ctrl+A'])
    // A rehydrating app must first render what the server did
    assert.deepEqual(labels, ['Ctrl+Q', 'Ctrl+A'])
  })

  test('reads the layout again for a label that mounts later', async (assert) => {
    let layout = AZERTY
    stubLayout(() => Promise.resolve(layout))
    await render(<template><Label @hotkeys={{windows}} /></template>)
    await loaded('a')
    await clearRender()

    layout = BEPO
    await render(<template><Label @hotkeys={{windows}} /></template>)
    await loaded('b')
    assert.deepEqual(texts('.label'), ['Ctrl+B'])
    assert.strictEqual(calls, 2)
  })

  test('follows a layout change when the window regains focus', async (assert) => {
    let layout = AZERTY
    stubLayout(() => Promise.resolve(layout))
    await render(<template><Label @hotkeys={{windows}} /><Reader /></template>)
    await loaded('a')
    assert.deepEqual(texts('.label'), ['Ctrl+A'])

    layout = BEPO
    window.dispatchEvent(new Event('focus'))
    await loaded('b')
    assert.deepEqual(texts('.label'), ['Ctrl+B'])
    assert.strictEqual(text('entry'), 'b')
    assert.strictEqual(calls, 2)
  })

  test('stops reading the layout on focus once no owner is rendered', async (assert) => {
    stubLayout(() => Promise.resolve(AZERTY))
    await render(<template><Label @hotkeys={{windows}} /><Reader /></template>)
    await loaded('a')
    await clearRender()
    window.dispatchEvent(new Event('focus'))
    assert.strictEqual(calls, 1)
  })

  test('labels alone do not read the layout on focus', async (assert) => {
    stubLayout(() => Promise.resolve(AZERTY))
    await render(<template><Label @hotkeys={{windows}} /></template>)
    await loaded('a')
    // `useFormatForDisplay` has no owner to stop for, so it reads once
    window.dispatchEvent(new Event('focus'))
    assert.strictEqual(calls, 1)
  })

  test('keeps conventional labels where the browser reports no layout', async (assert) => {
    stubKeyboard(undefined)
    await render(<template><Label @hotkeys={{windows}} /><Reader /></template>)
    assert.deepEqual(texts('.label'), ['Ctrl+Q'])
    assert.deepEqual(labels, ['Ctrl+Q'], 'renders once without a layout')
    assert.deepEqual(entries, [undefined])
  })

  test('lets a layoutMap passed to format win over the loaded layout', async (assert) => {
    stubLayout(() => Promise.resolve(AZERTY))
    await render(<template><Label @hotkeys={{windows}} /></template>)
    await loaded('a')
    assert.deepEqual(texts('.label'), ['Ctrl+A'])
    assert.deepEqual(texts('.custom'), ['X'])
  })

  test('does not load the layout for labels that all pass a layoutMap', async (assert) => {
    stubLayout(() => Promise.resolve(AZERTY))
    const format = useFormatForDisplay()
    const custom = CUSTOM
    await render(<template>
      <kbd id="plain">{{format "[KeyQ]" (hash layoutMap=custom)}}</kbd>
    </template>)
    assert.strictEqual(text('plain'), 'X')
    assert.strictEqual(calls, 0)
  })

  test('returns the layout from useKeyboardLayout', async (assert) => {
    stubLayout(() => Promise.resolve(AZERTY))
    await render(<template><Reader /></template>)
    await loaded('a')
    assert.strictEqual(text('entry'), 'a')
    assert.deepEqual(entries, [undefined, 'a'])
  })
})
