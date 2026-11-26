import { module, test } from 'qunit'
import { render, settled, clearRender } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import {
  HotkeyManager,
  createHotkeysScope,
  defineAppHotkeys,
  getHotkeyManager,
  provideAppHotkeys,
  useAppHotkeyList,
  useCustomHotkeys,
  useHotkey,
  useHotkeys,
} from '@tanstack/ember-hotkeys'
import type {
  EmberHotkeyDefinition,
  HotkeyPlatform,
} from '@tanstack/ember-hotkeys'

const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Control+S', meta: { name: 'Save' } },
  'palette.open': { hotkey: null },
  'nav.home': { hotkey: ['G', 'H'], options: { timeout: 400 } },
})

let instance: AppExample
let currentPlatform: HotkeyPlatform

class AppExample extends Component {
  @tracked count = 0
  list = useAppHotkeyList(this)
  custom = useCustomHotkeys(this)
  platform = currentPlatform
  save = () => {
    this.count++
  }
  saveHotkey = appHotkeys['doc.save']
  get definitions(): Array<EmberHotkeyDefinition> {
    return [
      { hotkey: appHotkeys['nav.home'], callback: () => {} },
      { hotkey: appHotkeys['palette.open'], callback: () => {} },
    ]
  }
  get statuses() {
    return this.list.value.map((item) => item.status).join(',')
  }
  constructor(...args: ConstructorParameters<typeof Component>) {
    super(...args)
    instance = this
  }
  <template>
    {{useHotkey this.saveHotkey this.save platform=this.platform}}
    {{useHotkeys this.definitions platform=this.platform}}
    <output id="count">{{this.count}}</output>
    <output id="statuses">{{this.statuses}}</output>
  </template>
}

async function key(key: string, options: KeyboardEventInit = {}) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }))
  document.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true, ...options }))
  await settled()
}

module('App hotkeys', (hooks) => {
  setupRenderingTest(hooks)
  let dispose: () => void
  const changes: Array<unknown> = []
  hooks.beforeEach(() => {
    changes.length = 0
  })
  function provide() {
    dispose = provideAppHotkeys(appHotkeys, {
      platform: currentPlatform,
      customHotkeys: { 'nav.home': ['G', 'G'] },
      onCustomHotkeysChange: (custom) => changes.push(custom),
    }).dispose
  }
  hooks.afterEach(async () => {
    await clearRender()
    dispose()
    HotkeyManager.resetInstance()
  })

  // Control+S is the Mod shortcut on Windows and Linux, so registration stores it as Mod+S there.
  for (const [testPlatform, savedHotkey] of [
    ['mac', 'Control+S'],
    ['windows', 'Mod+S'],
    ['linux', 'Mod+S'],
  ] as const) {
    test(`registers app hotkeys, lists status, and follows custom hotkeys on ${testPlatform}`, async (assert) => {
      currentPlatform = testPlatform
      provide()
      await render(<template><AppExample /></template>)
      assert.dom('#statuses').hasText('active,unbound,active')
      assert.deepEqual(
        [...getHotkeyManager().registrations.state.values()].map((r) => r.hotkey),
        [savedHotkey, ['G', 'G']],
      )
      await key('s', { ctrlKey: true })
      assert.dom('#count').hasText('1')

      // A recorded position conflicts through the key press that recorded it
      const recordedWith = {
        event: new KeyboardEvent('keydown', { key: 's', code: 'KeyS', ctrlKey: true }),
      }
      assert.deepEqual(instance.custom.findConflicts('palette.open', 'Control+[KeyS]'), [])
      assert.deepEqual(
        instance.custom.setCustomHotkey('palette.open', 'Control+[KeyS]', recordedWith).map((a) => a.id),
        ['doc.save'],
      )

      instance.custom.setCustomHotkey('doc.save', ['G', 'S'])
      instance.custom.setCustomHotkey('palette.open', 'Control+K')
      await settled()
      assert.dom('#statuses').hasText('active,active,active')
      assert.deepEqual(changes.at(-1), {
        'nav.home': ['G', 'G'],
        'doc.save': ['G', 'S'],
        'palette.open': 'Control+K',
      })
      await key('g')
      await key('s')
      assert.dom('#count').hasText('2')
    })
  }
})

const declaredHotkeys = defineAppHotkeys({
  'doc.print': {
    hotkey: 'Control+P',
    options: { preventDefault: false, stopPropagation: false },
  },
})
const scoped = createHotkeysScope({
  hotkey: { preventDefault: true, stopPropagation: true },
})

module('App hotkeys with scope defaults', (hooks) => {
  setupRenderingTest(hooks)

  hooks.afterEach(() => {
    HotkeyManager.resetInstance()
  })

  // Scope defaults are the lowest layer, below an app hotkey's declaration.
  test('an app hotkey declaration wins over scope defaults', async (assert) => {
    const { dispose } = provideAppHotkeys(declaredHotkeys)
    const print = declaredHotkeys['doc.print']
    const noop = () => {}
    await render(
      <template>
        {{scoped.useHotkey print noop}}
        <div {{scoped.onHotkey print noop}}></div>
      </template>,
    )
    assert.deepEqual(
      [...getHotkeyManager().registrations.state.values()].map((r) => ({
        preventDefault: r.options.preventDefault,
        stopPropagation: r.options.stopPropagation,
      })),
      [
        { preventDefault: false, stopPropagation: false },
        { preventDefault: false, stopPropagation: false },
      ],
    )
    await clearRender()
    dispose()
  })
})

// Defaults that differ from the built-in ones, so a lost default shows.
const quiet = createHotkeysScope({
  hotkey: { preventDefault: false, stopPropagation: false },
})

module('App hotkeys with scope defaults, by layer', (hooks) => {
  setupRenderingTest(hooks)

  hooks.afterEach(() => {
    HotkeyManager.resetInstance()
  })

  // Lists follow the same order, call-site options beat the declaration, and
  // a subclass of a scope's helper keeps the scope defaults.
  test('lists, call-site options and subclasses', async (assert) => {
    const { dispose } = provideAppHotkeys(declaredHotkeys)
    const noop = () => {}
    const list: Array<EmberHotkeyDefinition> = [
      { hotkey: declaredHotkeys['doc.print'], callback: noop },
    ]
    const SubHotkey = class extends quiet.useHotkey {}
    await render(
      <template>
        {{scoped.useHotkeys list stopPropagation=true}}
        <div {{scoped.onHotkeys list}}></div>
        {{SubHotkey "Control+K" noop}}
      </template>,
    )
    assert.deepEqual(
      [...getHotkeyManager().registrations.state.values()]
        .map(
          (r) =>
            // The key alone: Linux and Windows write `Control` as `Mod`.
            `${String(r.hotkey).slice(-1)} ${String(r.options.preventDefault)} ${String(r.options.stopPropagation)}`,
        )
        .sort(),
      ['K false false', 'P false false', 'P false true'],
    )
    await clearRender()
    dispose()
  })
})
