// @vitest-environment node
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import {
  defineAppHotkeys,
  getHotkeyManager,
  getKeyStateTracker,
} from '@tanstack/hotkeys'
import { describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useHeldKeyCodes } from '../src/useHeldKeyCodes'
import { useHeldKeys } from '../src/useHeldKeys'
import { useHotkey } from '../src/useHotkey'
import { useHotkeyHint } from '../src/useHotkeyHint'
import { useHotkeyRecorder } from '../src/useHotkeyRecorder'
import { useHotkeyRegistrations } from '../src/useHotkeyRegistrations'
import { useHotkeyScopesState } from '../src/useHotkeyScopesState'
import { useKeyHold } from '../src/useKeyHold'
import type * as VueStore from '@tanstack/vue-store'

// Counts live useSelector subscriptions on any store, including stores that
// are private to the adapter.
const live = vi.hoisted(() => ({ count: 0 }))
vi.mock('@tanstack/vue-store', async (importOriginal) => {
  const mod = await importOriginal<typeof VueStore>()
  return {
    ...mod,
    useSelector: ((source, selector, options) =>
      mod.useSelector(
        {
          get: () => source.get(),
          subscribe: (listener: Parameters<typeof source.subscribe>[0]) => {
            live.count++
            const subscription = source.subscribe(listener)
            return {
              unsubscribe: () => {
                live.count--
                subscription.unsubscribe()
              },
            }
          },
        },
        selector,
        options,
      )) as typeof mod.useSelector,
  }
})

/** Live subscribers on a store, read from its atom's subscriber list. */
function subscriberCount(store: object): number {
  let count = 0
  for (let link = (store as any).atom.subs; link; link = link.nextSub) count++
  return count
}

function snapshot() {
  const manager = getHotkeyManager()
  return {
    tracker: subscriberCount(getKeyStateTracker().store),
    registrations: subscriberCount(manager.registrations),
    scopes: subscriberCount(manager.scopes),
    useSelector: live.count,
  }
}

const appHotkeys = defineAppHotkeys({
  open: { hotkey: 'Mod+O', name: 'Open' },
})

const EveryComposable = defineComponent({
  setup() {
    useHotkey('Mod+K', () => {})
    useHotkey(appHotkeys.open, () => {})
    const held = useHeldKeys()
    const codes = useHeldKeyCodes()
    const shift = useKeyHold('Shift')
    const hint = useHotkeyHint('Mod+K')
    const registrations = useHotkeyRegistrations()
    const scopes = useHotkeyScopesState()
    const recorder = useHotkeyRecorder({ onRecord: () => {} })
    return () =>
      h(
        'div',
        JSON.stringify([
          held.value,
          codes.value,
          shift.value,
          hint.value,
          registrations.value.length,
          scopes.value.active,
          recorder.isRecording.value,
        ]),
      )
  },
})

describe('server rendering', () => {
  it('runs without a document', () => {
    expect(typeof document).toBe('undefined')
  })

  it('renders current values without subscribing to any store', async () => {
    const before = snapshot()
    let html = ''
    for (let i = 0; i < 100; i++) {
      html = await renderToString(createSSRApp(EveryComposable))
    }
    expect(html).toBe('<div>[[],{},false,false,0,[],false]</div>')
    expect(snapshot()).toEqual(before)
  })

  it('leaves no subscribers inside a HotkeysProvider', async () => {
    const before = snapshot()
    for (let i = 0; i < 100; i++) {
      await renderToString(
        createSSRApp({
          render: () =>
            h(HotkeysProvider, { appHotkeys }, () => h(EveryComposable)),
        }),
      )
    }
    expect(snapshot()).toEqual(before)
  })
})
