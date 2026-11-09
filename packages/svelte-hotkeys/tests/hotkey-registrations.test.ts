import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import { keydown } from '@tanstack/hotkeys-test-utils'
import { flushSync, mount, unmount } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HotkeyView from './HotkeyView.svelte'
import RegistrationsView from './RegistrationsView.svelte'
import type {
  HotkeyRegistrationView,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { KeyOptions } from '@tanstack/hotkeys-test-utils'

// Adapter harness. The cases below are shared word for word with the other
// adapters' registration tests, so keep adapter details in this section.

interface HotkeyProps {
  hotkey: RegisterableHotkey
  enabled?: boolean
  meta?: { name: string }
}

const mounted: Array<() => void> = []

function mountRegistrations() {
  const target = document.body.appendChild(document.createElement('div'))
  let latest: Array<HotkeyRegistrationView> = []
  const component = mount(RegistrationsView, {
    target,
    props: { onValue: (value) => (latest = value) },
  })
  flushSync()
  const unmountView = () => {
    void unmount(component)
    flushSync()
    target.remove()
  }
  mounted.push(unmountView)
  return {
    list: () => latest,
    rendered: () =>
      Number(target.querySelector('[data-testid="count"]')?.textContent),
    unmount: unmountView,
  }
}

function mountHotkey(initial: HotkeyProps) {
  let update!: (next: Partial<HotkeyProps>) => void
  const component = mount(HotkeyView, {
    target: document.body,
    props: { initial, ready: (fn) => (update = fn) },
  })
  flushSync()
  const unmountView = () => {
    void unmount(component)
    flushSync()
  }
  mounted.push(unmountView)
  return {
    update: (next: Partial<HotkeyProps>) => {
      update(next)
      flushSync()
    },
    unmount: unmountView,
  }
}

const run = (change: () => void) => {
  change()
  flushSync()
}
const press = (options: KeyOptions) => {
  keydown({ target: document, ...options })
  flushSync()
}

beforeEach(() => {
  HotkeyManager.resetInstance()
})

afterEach(() => {
  for (const unmountView of mounted.splice(0)) {
    try {
      unmountView()
    } catch {
      // Already unmounted by the test.
    }
  }
  document.body.innerHTML = ''
  HotkeyManager.resetInstance()
})

// Shared cases

/** Counts the live subscriptions on the manager's registrations store. */
function trackSubscriptions() {
  const store = getHotkeyManager().registrations
  const subscribe = store.subscribe.bind(store)
  let active = 0
  vi.spyOn(store, 'subscribe').mockImplementation((listener) => {
    const subscription = subscribe(listener)
    let live = true
    active++
    return {
      unsubscribe() {
        if (live) active--
        live = false
        subscription.unsubscribe()
      },
    }
  })
  return () => active
}

describe('hotkey registrations', () => {
  it('starts empty', () => {
    const view = mountRegistrations()
    expect(view.list()).toEqual([])
    expect(view.rendered()).toBe(0)
  })

  it('lists a hotkey while its component is mounted', () => {
    const view = mountRegistrations()
    const hotkey = mountHotkey({ hotkey: 'Mod+K' })
    expect(view.list().map((reg) => reg.hotkey)).toEqual(['Mod+K'])
    expect(view.rendered()).toBe(1)
    hotkey.unmount()
    expect(view.list()).toEqual([])
    expect(view.rendered()).toBe(0)
  })

  it('reflects registrations added and removed on the manager', () => {
    const view = mountRegistrations()
    const manager = getHotkeyManager()
    let first: ReturnType<typeof manager.register> | undefined
    run(() => {
      first = manager.register('Mod+S', () => {})
      manager.register('Escape', () => {})
    })
    expect(view.list().map((reg) => reg.hotkey)).toEqual(['Mod+S', 'Escape'])
    run(() => first!.unregister())
    expect(view.list().map((reg) => reg.hotkey)).toEqual(['Escape'])
  })

  it('shows the options a hotkey was registered with', () => {
    const view = mountRegistrations()
    mountHotkey({ hotkey: 'Mod+S', meta: { name: 'Save' } })
    expect(view.list()[0]!.options).toMatchObject({
      enabled: true,
      meta: { name: 'Save' },
    })
  })

  it('does not expose callbacks', () => {
    const view = mountRegistrations()
    mountHotkey({ hotkey: 'Mod+S' })
    expect(view.list()[0]).not.toHaveProperty('callback')
    expect(view.list()[0]!.options).not.toHaveProperty('callback')
  })

  it('updates when a hotkey is disabled and enabled again', () => {
    const view = mountRegistrations()
    const hotkey = mountHotkey({ hotkey: 'Mod+S' })
    expect(view.list()[0]).toMatchObject({ status: 'active' })
    hotkey.update({ enabled: false })
    expect(view.list()).toHaveLength(1)
    expect(view.list()[0]).toMatchObject({
      options: { enabled: false },
      status: 'disabled',
    })
    hotkey.update({ enabled: true })
    expect(view.list()[0]).toMatchObject({
      options: { enabled: true },
      status: 'active',
    })
  })

  it('updates when the hotkey string changes', () => {
    const view = mountRegistrations()
    const hotkey = mountHotkey({ hotkey: 'Mod+S' })
    hotkey.update({ hotkey: 'Mod+J' })
    expect(view.list().map((reg) => reg.hotkey)).toEqual(['Mod+J'])
    expect(view.rendered()).toBe(1)
  })

  it('shows the scope of a registration and whether it can fire', () => {
    const view = mountRegistrations()
    const manager = getHotkeyManager()
    run(() => void manager.register('Escape', () => {}, { scope: 'dialog' }))
    expect(view.list()[0]).toMatchObject({
      options: { scope: 'dialog' },
      status: 'suspended',
    })
    let release = () => {}
    run(() => (release = manager.activateScope('dialog')))
    expect(view.list()[0]).toMatchObject({ status: 'active' })
    run(() => release())
    expect(view.list()[0]).toMatchObject({ status: 'suspended' })
  })

  it('lists sequences with their steps and progress', () => {
    const view = mountRegistrations()
    mountHotkey({ hotkey: ['G', 'H'] })
    expect(view.list()[0]).toMatchObject({
      kind: 'sequence',
      hotkey: ['G', 'H'],
      matchedStepCount: 0,
    })
    press({ key: 'g', code: 'KeyG' })
    expect(view.list()[0]).toMatchObject({ matchedStepCount: 1 })
  })

  it('unsubscribes from the registry on unmount', () => {
    const active = trackSubscriptions()
    const view = mountRegistrations()
    expect(active()).toBeGreaterThan(0)
    view.unmount()
    expect(active()).toBe(0)
  })

  it('does not add subscriptions when remounted', () => {
    const active = trackSubscriptions()
    const first = mountRegistrations()
    const mounted = active()
    first.unmount()
    const second = mountRegistrations()
    expect(active()).toBe(mounted)
    run(() => void getHotkeyManager().register('Escape', () => {}))
    expect(second.rendered()).toBe(1)
  })
})
