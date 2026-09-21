import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'solid-js/web'
import {
  HotkeyManager,
  KeyStateTracker,
  SequenceManager,
} from '@tanstack/hotkeys'
import {
  HotkeysContextProvider,
  useHotkeysDevtoolsState,
} from '../src/HotkeysContextProvider'
import { HotkeyList } from '../src/components/HotkeyList'
import { DetailsPanel } from '../src/components/DetailsPanel'

// Stable class names let these tests inspect the real UI without coupling to CSS generation.
vi.mock('../src/styles/use-styles', () => ({
  useStyles: () => () => new Proxy({}, { get: (_, key) => key }),
}))

const options = { platform: 'windows', conflictBehavior: 'allow' } as const
let dispose: (() => void) | undefined

/** Mount the shared UI with its real subscriptions and an optional selected registration. */
function mount(selectedId?: string) {
  const container = document.createElement('div')
  document.body.append(container)
  function Panel() {
    const state = useHotkeysDevtoolsState()
    return (
      <>
        <HotkeyList
          selectedId={() => selectedId ?? null}
          setSelectedId={() => {}}
        />
        <DetailsPanel
          selectedRegistration={() =>
            [...state.registrations(), ...state.sequenceRegistrations()].find(
              (r) => r.id === selectedId,
            ) ?? null
          }
        />
      </>
    )
  }
  dispose = render(
    () => (
      <HotkeysContextProvider>
        <Panel />
      </HotkeysContextProvider>
    ),
    container,
  )
  return container
}

afterEach(() => {
  dispose?.()
  dispose = undefined
  HotkeyManager.resetInstance()
  SequenceManager.resetInstance()
  KeyStateTracker.resetInstance()
  document.body.replaceChildren()
})

describe('shared devtools registrations', () => {
  it('shows equivalent physical bindings as conflicts in the list and details', () => {
    const manager = HotkeyManager.getInstance()
    const first = manager.register('Control+[KeyS]', () => {}, options)
    manager.register('Mod+[KeyS]', () => {}, options)
    const ui = mount(first.id)
    expect(ui.querySelectorAll('.hotkeyBadges .badgeConflict')).toHaveLength(2)
    expect(ui.querySelectorAll('.conflictList > div')).toHaveLength(1)
  })

  it('updates sequence-prefix and hotkey/sequence conflicts when either registry changes', async () => {
    const sequences = SequenceManager.getInstance()
    const first = sequences.register(['[KeyG]', '[KeyG]'], () => {}, options)
    const ui = mount(first.id)
    expect(ui.querySelector('.conflictList')).toBeNull()
    const hotkey = HotkeyManager.getInstance().register(
      '[KeyG]',
      () => {},
      options,
    )
    const longer = sequences.register(
      ['[KeyG]', '[KeyG]', '[KeyH]'],
      () => {},
      options,
    )
    await Promise.resolve()
    expect(ui.querySelectorAll('.conflictList > div')).toHaveLength(2)
    expect(ui.querySelectorAll('.hotkeyBadges .badgeConflict')).toHaveLength(3)
    hotkey.setOptions({ enabled: false })
    longer.unregister()
    await Promise.resolve()
    expect(ui.querySelector('.conflictList')).toBeNull()
  })

  it('distinguishes overlapping targets from disjoint scopes and excludes other event types', () => {
    const manager = HotkeyManager.getInstance()
    const parent = document.createElement('div')
    const child = document.createElement('div')
    parent.append(child)
    const first = manager.register('[KeyS]', () => {}, {
      ...options,
      target: parent,
    })
    manager.register('[KeyS]', () => {}, { ...options, target: child })
    manager.register('[KeyS]', () => {}, {
      ...options,
      target: document.createElement('div'),
    })
    manager.register('[KeyS]', () => {}, {
      ...options,
      target: child,
      eventType: 'keyup',
    })
    const ui = mount(first.id)
    expect(ui.querySelectorAll('.conflictList .conflictItem')).toHaveLength(1)
    expect(
      ui.querySelectorAll('.conflictList .conflictItemScope'),
    ).toHaveLength(1)
  })

  it.each(['hotkey', 'sequence'] as const)(
    'renders a literal plus keycap for a %s',
    (kind) => {
      const handle =
        kind === 'hotkey'
          ? HotkeyManager.getInstance().register('Mod++', () => {}, options)
          : SequenceManager.getInstance().register(
              ['Mod++', '[KeyS]'],
              () => {},
              options,
            )
      const ui = mount(handle.id)
      const parts = Array.from(
        ui.querySelectorAll('.keyBreakdownSplitLeft .keyCapLarge'),
        (node) => node.textContent,
      )
      expect(parts.slice(0, 2)).toEqual(['Ctrl', '+'])
      expect(parts).not.toContain('')
      expect(parts).not.toContain('[KeyS]')
    },
  )

  it.each(['hotkey', 'sequence'] as const)(
    'searches %s groups and reacts to metadata changes',
    async (kind) => {
      const opts = { ...options, meta: { name: 'Save', group: 'Documents' } }
      const handle =
        kind === 'hotkey'
          ? HotkeyManager.getInstance().register('Mod+[KeyS]', () => {}, opts)
          : SequenceManager.getInstance().register(
              ['[KeyG]', '[KeyS]'],
              () => {},
              opts,
            )
      const ui = mount()
      const input = ui.querySelector('input')!
      input.value = 'Documents'
      input.dispatchEvent(new Event('input', { bubbles: true }))
      expect(ui.querySelectorAll('.hotkeyRow')).toHaveLength(1)
      handle.setOptions({ meta: { name: 'Save', group: 'Editor' } })
      await Promise.resolve()
      expect(ui.querySelectorAll('.hotkeyRow')).toHaveLength(0)
    },
  )

  it('normalizes sequence aliases without assuming that logical and physical labels conflict', () => {
    const sequences = SequenceManager.getInstance()
    const first = sequences.register(
      ['Control+[KeyS]', 'Escape'],
      () => {},
      options,
    )
    sequences.register(['Mod+[KeyS]', 'Escape'], () => {}, options)
    sequences.register(['Mod+S', 'Escape'], () => {}, options)
    const ui = mount(first.id)
    expect(ui.querySelectorAll('.conflictList > div')).toHaveLength(1)
    expect(ui.querySelectorAll('.hotkeyBadges .badgeConflict')).toHaveLength(2)
  })

  it('does not mark disabled candidates or different resolved modifiers as conflicts', () => {
    const manager = HotkeyManager.getInstance()
    const first = manager.register('Mod+[KeyS]', () => {}, options)
    manager.register('Mod+[KeyS]', () => {}, { ...options, platform: 'mac' })
    manager.register('Mod+[KeyS]', () => {}, { ...options, enabled: false })
    const ui = mount(first.id)
    expect(ui.querySelectorAll('.hotkeyBadges .badgeConflict')).toHaveLength(0)
    expect(ui.querySelector('.conflictList')).toBeNull()
  })

  it.each(['hotkey', 'sequence'] as const)(
    'triggers a physical %s with its code intact',
    (kind) => {
      const callback = vi.fn()
      const handle =
        kind === 'hotkey'
          ? HotkeyManager.getInstance().register(
              'Mod+[KeyS]',
              callback,
              options,
            )
          : SequenceManager.getInstance().register(
              ['[KeyG]', '[KeyS]'],
              callback,
              options,
            )
      const ui = mount(handle.id)
      ui.querySelector('.actionButton')!.dispatchEvent(
        new MouseEvent('mousedown', { bubbles: true }),
      )
      expect(callback).toHaveBeenCalledOnce()
      expect(callback.mock.calls[0]![0].code).toBe('KeyS')
      expect(callback.mock.calls[0]![0].key).toBe('')
    },
  )

  it('distinguishes logical, physical, and mixed registrations', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+S', () => {}, options)
    manager.register('Mod+[KeyS]', () => {}, options)
    const mixed = SequenceManager.getInstance().register(
      ['G', '[KeyS]'],
      () => {},
      options,
    )
    const ui = mount(mixed.id)
    const badges = Array.from(
      ui.querySelectorAll('[data-binding-kind]'),
      (node) => node.textContent,
    )
    expect(badges).toContain('Key')
    expect(badges).toContain('Code')
    expect(badges).toContain('Mixed')
  })
})
