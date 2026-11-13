import {
  AppHotkeysStore,
  HotkeyManager,
  KeyStateTracker,
  defineAppHotkeys,
} from '@tanstack/hotkeys'
import { render } from 'solid-js/web'
import { afterEach, describe, expect, it, vi } from 'vitest'
import HotkeysDevtools from '../src/components/index'
import type { HotkeyEventType } from '@tanstack/hotkeys'

// Stable class names let these tests inspect the real UI without coupling to CSS generation.
vi.mock('../src/styles/use-styles', () => ({
  useStyles: () => () => new Proxy({}, { get: (_, key) => key }),
}))

const options = { platform: 'windows', conflictBehavior: 'allow' } as const
let dispose: (() => void) | undefined

/** Mounts the whole panel, as the devtools dock does, inside `parent`. */
function mountPanel(parent: HTMLElement = document.body) {
  const container = document.createElement('div')
  parent.append(container)
  dispose = render(() => <HotkeysDevtools theme="dark" />, container)
  return container
}

const text = (node: Element | null | undefined) =>
  node?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
const rows = (ui: Element) =>
  Array.from(ui.querySelectorAll('.hotkeyRow:not(.hotkeyRowInactive)'))
const rowLabels = (ui: Element) =>
  rows(ui).map((row) => text(row.querySelector('.hotkeyLabelKeys')))
const listHeader = (ui: Element) =>
  Array.from(ui.querySelectorAll('.panelHeader'), text).find((t) =>
    t.startsWith('Hotkeys ('),
  )
const details = (ui: Element) => ui.querySelector('.stateDetails')!
/** Option and meta values in the details panel, by label. */
const detailRows = (ui: Element) =>
  Object.fromEntries(
    Array.from(details(ui).querySelectorAll('.optionRow'), (row) => [
      text(row.querySelector('.optionLabel')),
      text(row.querySelector('.optionLabel + span')),
    ]),
  )
const infoGrid = (ui: Element) => {
  const cells = Array.from(
    details(ui).querySelectorAll('.infoGrid > div'),
    text,
  )
  const result: Record<string, string> = {}
  for (let i = 0; i < cells.length; i += 2) result[cells[i]!] = cells[i + 1]!
  return result
}
const click = (el: Element) =>
  el.dispatchEvent(new MouseEvent('click', { bubbles: true }))
const search = (ui: Element, query: string) => {
  const input = ui.querySelector('input')!
  input.value = query
  input.dispatchEvent(new Event('input', { bubbles: true }))
}
const press = (
  type: HotkeyEventType,
  key: string,
  code: string,
  init: KeyboardEventInit = {},
) =>
  document.dispatchEvent(
    new KeyboardEvent(type, { key, code, bubbles: true, ...init }),
  )

afterEach(() => {
  dispose?.()
  dispose = undefined
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
  document.body.replaceChildren()
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('devtools shell', () => {
  it('shows empty states before anything is registered or held', () => {
    KeyStateTracker.getInstance()
    const ui = mountPanel()
    expect(text(ui.querySelector('.noKeysHeld'))).toBe('--')
    expect(listHeader(ui)).toBe('Hotkeys (0)')
    expect(rows(ui)).toHaveLength(0)
    expect(text(ui.querySelector('.noSelection'))).toBe(
      'Select a hotkey from the list to view its details',
    )
    expect(ui.textContent).not.toContain('Declared, not registered')
  })

  it('lists registrations as they come and go', () => {
    const manager = HotkeyManager.getInstance()
    const ui = mountPanel()
    const save = manager.register('Mod+S', () => {}, options)
    manager.register(['G', 'H'], () => {}, options)
    expect(listHeader(ui)).toBe('Hotkeys (2)')
    expect(rowLabels(ui)).toEqual(['Ctrl+S', 'G H'])
    save.unregister()
    expect(rowLabels(ui)).toEqual(['G H'])
  })

  it('selects a row, shows its details, and clears them when it unregisters', () => {
    const manager = HotkeyManager.getInstance()
    const save = manager.register('Mod+S', () => {}, {
      ...options,
      meta: { name: 'Save', description: 'Saves the file' },
    })
    manager.register('Mod+K', () => {}, options)
    const ui = mountPanel()
    click(rows(ui)[0]!)
    expect(rows(ui)[0]!.classList.contains('hotkeyRowSelected')).toBe(true)
    expect(rows(ui)[1]!.classList.contains('hotkeyRowSelected')).toBe(false)
    expect(text(details(ui).querySelector('.stateTitle'))).toBe('Ctrl+S')
    expect(infoGrid(ui)).toMatchObject({
      ID: save.id,
      Matches: 'Key',
      Raw: 'Mod+S',
      Target: 'document',
    })
    expect(detailRows(ui)).toMatchObject({
      name: 'Save',
      description: 'Saves the file',
    })

    click(rows(ui)[1]!)
    expect(text(details(ui).querySelector('.stateTitle'))).toBe('Ctrl+K')

    click(rows(ui)[0]!)
    save.unregister()
    expect(text(ui.querySelector('.noSelection'))).toContain('Select a hotkey')
  })

  it('shows declared app hotkeys in the list and their details when selected', () => {
    const store = new AppHotkeysStore(
      defineAppHotkeys({
        'doc.save': {
          hotkey: 'F2',
          scope: 'editor',
          meta: { name: 'Save', group: 'File' },
          options: { preventDefault: true },
        },
        'palette.open': { hotkey: null },
      }),
      { customHotkeys: { 'doc.save': 'F3' } },
    )
    HotkeyManager.getInstance().appHotkeys.setState(() => store)
    const ui = mountPanel()
    const declared = Array.from(ui.querySelectorAll('.hotkeyRowInactive'))
    expect(declared.map(text)).toEqual([
      expect.stringMatching(
        /^F3 ?Save ?editor ?custom ?inactive ?Declared but not registered on this page$/,
      ),
      expect.stringMatching(
        /^Unassigned ?palette\.open ?unbound ?Declared without a hotkey$/,
      ),
    ])

    click(declared[0]!)
    expect(declared[0]!.classList.contains('hotkeyRowSelected')).toBe(true)
    expect(infoGrid(ui)).toMatchObject({
      'App hotkey': 'doc.save',
      Status: 'inactive',
      Default: 'F2 (customized)',
      Scope: 'editor',
    })
    expect(detailRows(ui)).toEqual({
      name: 'Save',
      group: 'File',
      preventDefault: 'true',
    })

    click(declared[1]!)
    expect(text(details(ui).querySelector('.stateTitle'))).toBe('Unassigned')
    expect(infoGrid(ui)).toMatchObject({ Scope: 'global' })
    expect(detailRows(ui)).toEqual({ meta: '—', options: '—' })
  })

  it('moves an app hotkey out of the declared list once it registers', () => {
    const store = new AppHotkeysStore(
      defineAppHotkeys({ 'doc.save': { hotkey: 'Mod+S' } }),
    )
    const manager = HotkeyManager.getInstance()
    manager.appHotkeys.setState(() => store)
    const ui = mountPanel()
    expect(ui.querySelectorAll('.hotkeyRowInactive')).toHaveLength(1)
    const handle = manager.register('Mod+S', () => {}, {
      ...options,
      appHotkeyId: 'doc.save',
    })
    expect(ui.querySelectorAll('.hotkeyRowInactive')).toHaveLength(0)
    expect(rowLabels(ui)).toEqual(['Ctrl+S'])
    handle.unregister()
    expect(ui.querySelectorAll('.hotkeyRowInactive')).toHaveLength(1)
  })
})

describe('held keys bar', () => {
  it('follows real keydown and keyup events', () => {
    KeyStateTracker.getInstance()
    const ui = mountPanel()
    const bar = () => ui.querySelector('.heldKeysBar')!
    const caps = () =>
      Array.from(bar().querySelectorAll('.keyCap'), (cap) => ({
        label: text(cap.firstElementChild),
        code: cap.querySelector('.keyCapCode')?.textContent ?? null,
      }))

    press('keydown', 'a', 'KeyA')
    press('keydown', 'Escape', 'Escape')
    expect(caps()).toEqual([
      { label: 'A', code: 'KeyA' },
      { label: 'Esc', code: null },
    ])
    expect(bar().querySelector('.noKeysHeld')).toBeNull()

    press('keyup', 'a', 'KeyA')
    expect(caps()).toEqual([{ label: 'Esc', code: null }])
    press('keyup', 'Escape', 'Escape')
    expect(caps()).toEqual([])
    expect(text(bar().querySelector('.noKeysHeld'))).toBe('--')
  })

  it('clears held keys when the window loses focus', () => {
    KeyStateTracker.getInstance()
    const ui = mountPanel()
    press('keydown', 'b', 'KeyB')
    expect(ui.querySelectorAll('.heldKeysBar .keyCap')).toHaveLength(1)
    window.dispatchEvent(new Event('blur'))
    expect(ui.querySelectorAll('.heldKeysBar .keyCap')).toHaveLength(0)
  })
})

describe('search', () => {
  function register() {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+S', () => {}, {
      ...options,
      meta: { name: 'Save', description: 'Write the file', group: 'File' },
    })
    manager.register('Mod+K', () => {}, {
      ...options,
      scope: 'palette',
      meta: { name: 'Command palette' },
    })
    manager.register(['G', 'H'], () => {}, {
      ...options,
      meta: { name: 'Go home' },
    })
  }

  it.each([
    ['name', 'Save', ['Ctrl+S']],
    ['description', 'Write the file', ['Ctrl+S']],
    ['scope', 'palette', ['Ctrl+K']],
    ['formatted label', 'Ctrl+K', ['Ctrl+K']],
    ['raw hotkey', 'Mod+K', ['Ctrl+K']],
    ['raw sequence', 'G H', ['G H']],
  ])('matches by %s', (_, query, expected) => {
    register()
    const ui = mountPanel()
    search(ui, query)
    expect(rowLabels(ui)).toEqual(expected)
    expect(listHeader(ui)).toBe(`Hotkeys (${expected.length})`)
  })

  it('shows no rows for a query that matches nothing, and the clear button restores them', () => {
    register()
    const ui = mountPanel()
    expect(ui.querySelector('.searchClear')).toBeNull()
    search(ui, 'zzzz-nothing')
    expect(rows(ui)).toHaveLength(0)
    expect(listHeader(ui)).toBe('Hotkeys (0)')
    expect(ui.querySelectorAll('.scopeGroup')).toHaveLength(0)

    click(ui.querySelector('.searchClear')!)
    expect(ui.querySelector('input')!.value).toBe('')
    expect(rows(ui)).toHaveLength(3)
    expect(ui.querySelector('.searchClear')).toBeNull()
  })

  it('treats a whitespace-only query as no query', () => {
    register()
    const ui = mountPanel()
    search(ui, '   ')
    expect(rows(ui)).toHaveLength(3)
  })

  it('filters declared app hotkeys too', () => {
    const store = new AppHotkeysStore(
      defineAppHotkeys({
        'doc.print': { hotkey: 'Mod+P', meta: { name: 'Print' } },
        'doc.export': { hotkey: 'Mod+E', scope: 'editor' },
      }),
    )
    HotkeyManager.getInstance().appHotkeys.setState(() => store)
    const ui = mountPanel()
    const declared = () =>
      Array.from(ui.querySelectorAll('.hotkeyRowInactive'), text)
    expect(declared()).toHaveLength(2)
    search(ui, 'Print')
    expect(declared()).toEqual([expect.stringContaining('Print')])
    search(ui, 'editor')
    expect(declared()).toEqual([expect.stringContaining('doc.export')])
    expect(
      Array.from(ui.querySelectorAll('.panelHeader'), text),
    ).toContainEqual('Declared, not registered (1)')
  })

  it('keeps the selection while the selected row is filtered out', () => {
    register()
    const ui = mountPanel()
    click(rows(ui)[0]!)
    search(ui, 'palette')
    expect(rowLabels(ui)).toEqual(['Ctrl+K'])
    expect(text(details(ui).querySelector('.stateTitle'))).toBe('Ctrl+S')
  })
})

describe('resize', () => {
  const leftPanel = (ui: Element) =>
    ui.querySelector<HTMLElement>('.leftPanel')!
  const mouse = (target: EventTarget, type: string, clientX: number) =>
    target.dispatchEvent(
      new MouseEvent(type, { clientX, bubbles: true, cancelable: true }),
    )

  it('drags the divider to resize the list within 150px and 800px', () => {
    const ui = mountPanel()
    const handle = ui.querySelector('.dragHandle')!
    expect(leftPanel(ui).style.width).toBe('440px')

    mouse(handle, 'mousedown', 500)
    expect(handle.classList.contains('dragging')).toBe(true)
    expect(document.body.style.cursor).toBe('col-resize')
    expect(document.body.style.userSelect).toBe('none')

    mouse(document, 'mousemove', 560)
    expect(leftPanel(ui).style.width).toBe('500px')
    mouse(document, 'mousemove', -2000)
    expect(leftPanel(ui).style.width).toBe('150px')
    mouse(document, 'mousemove', 5000)
    expect(leftPanel(ui).style.width).toBe('800px')

    mouse(document, 'mouseup', 5000)
    expect(handle.classList.contains('dragging')).toBe(false)
    expect(document.body.style.cursor).toBe('')
    expect(document.body.style.userSelect).toBe('')
    mouse(document, 'mousemove', 100)
    expect(leftPanel(ui).style.width).toBe('800px')
  })

  it('starts each drag from the current width', () => {
    const ui = mountPanel()
    const handle = ui.querySelector('.dragHandle')!
    mouse(handle, 'mousedown', 0)
    mouse(document, 'mousemove', -100)
    mouse(document, 'mouseup', -100)
    expect(leftPanel(ui).style.width).toBe('340px')
    mouse(handle, 'mousedown', 1000)
    mouse(document, 'mousemove', 1050)
    expect(leftPanel(ui).style.width).toBe('390px')
  })

  it('ignores mouse moves without a drag', () => {
    const ui = mountPanel()
    mouse(document, 'mousemove', 50)
    expect(leftPanel(ui).style.width).toBe('440px')
  })

  it('stops listening to the document after unmount', () => {
    const remove = vi.spyOn(document, 'removeEventListener')
    mountPanel()
    dispose!()
    dispose = undefined
    const removed = remove.mock.calls.map(([type]) => type)
    expect(removed).toContain('mousemove')
    expect(removed).toContain('mouseup')
  })
})

describe('plugin host height', () => {
  /** A ResizeObserver stand-in the test can fire by hand. */
  function stubResizeObserver() {
    const observers: Array<{
      callback: ResizeObserverCallback
      targets: Array<Element>
      disconnected: boolean
    }> = []
    vi.stubGlobal(
      'ResizeObserver',
      class {
        entry: (typeof observers)[number]
        constructor(callback: ResizeObserverCallback) {
          this.entry = { callback, targets: [], disconnected: false }
          observers.push(this.entry)
        }
        observe(target: Element) {
          this.entry.targets.push(target)
        }
        unobserve() {}
        disconnect() {
          this.entry.disconnected = true
        }
      },
    )
    return observers
  }
  const shellRoot = (ui: Element) =>
    ui.querySelector<HTMLElement>('.shellRoot')!

  it('sizes the shell to the plugin container and follows its resizes', () => {
    const observers = stubResizeObserver()
    const host = document.createElement('div')
    host.id = 'plugin-container-hotkeys'
    let height = 321.4
    Object.defineProperty(host, 'clientHeight', { get: () => height })
    document.body.append(host)
    const ui = mountPanel(host)
    expect(shellRoot(ui).style.height).toBe('321px')
    expect(shellRoot(ui).style.maxHeight).toBe('321px')
    expect(observers[0]!.targets).toEqual([host])

    height = 500
    observers[0]!.callback([], {} as ResizeObserver)
    expect(shellRoot(ui).style.height).toBe('500px')

    dispose!()
    dispose = undefined
    expect(observers[0]!.disconnected).toBe(true)
  })

  it('falls back to the observed size while the container reports no height', () => {
    const observers = stubResizeObserver()
    const host = document.createElement('div')
    host.id = 'plugin-container-hotkeys'
    document.body.append(host)
    const ui = mountPanel(host)
    expect(shellRoot(ui).style.height).toBe('')

    observers[0]!.callback(
      [
        {
          borderBoxSize: [{ blockSize: 240.6, inlineSize: 0 }],
          contentRect: { height: 0 },
        } as unknown as ResizeObserverEntry,
      ],
      {} as ResizeObserver,
    )
    expect(shellRoot(ui).style.height).toBe('241px')

    observers[0]!.callback(
      [
        {
          borderBoxSize: [],
          contentRect: { height: 180 },
        } as unknown as ResizeObserverEntry,
      ],
      {} as ResizeObserver,
    )
    expect(shellRoot(ui).style.height).toBe('180px')
  })

  it('uses the third ancestor when no plugin container is found', () => {
    const observers = stubResizeObserver()
    const outer = document.createElement('section')
    document.body.append(outer)
    mountPanel(outer)
    // shellRoot -> theme wrapper -> mount container -> outer
    expect(observers[0]!.targets).toEqual([outer])
  })

  it('leaves the height alone without ResizeObserver', () => {
    vi.stubGlobal('ResizeObserver', undefined)
    const host = document.createElement('div')
    host.id = 'plugin-container-hotkeys'
    Object.defineProperty(host, 'clientHeight', { get: () => 300 })
    document.body.append(host)
    const ui = mountPanel(host)
    expect(shellRoot(ui).style.height).toBe('')
  })
})

describe('registration rows', () => {
  const badges = (row: Element) =>
    Array.from(row.querySelectorAll('.hotkeyBadges > .badge'), (badge) =>
      text(badge.firstChild as Element),
    )

  it('shows kind, enabled, event type, and target badges', () => {
    const manager = HotkeyManager.getInstance()
    const button = document.createElement('button')
    button.id = 'save'
    button.className = 'primary  big'
    button.dataset.testid = 'save-button'
    document.body.append(button)
    manager.register('Mod+S', () => {}, options)
    manager.register(['G', 'H'], () => {}, {
      ...options,
      enabled: false,
      eventType: 'keyup',
      target: window,
    })
    manager.register('Escape', () => {}, { ...options, target: button })
    const ui = mountPanel()
    const [save, sequence, escape] = rows(ui)
    expect(badges(save!)).toEqual(['Key', 'on', 'keydown', 'document'])
    expect(badges(sequence!)).toEqual(['seq', 'Key', 'off', 'keyup', 'window'])
    expect(badges(escape!)).toEqual(['Key', 'on', 'keydown', 'button'])

    const tooltips = (row: Element) =>
      Array.from(row.querySelectorAll('.tooltipText'), text)
    expect(tooltips(save!)).toEqual([
      'Hotkey is enabled',
      'Fires on keydown event',
      'Listening on document',
    ])
    expect(tooltips(sequence!)).toContain('Hotkey is disabled')
    expect(tooltips(sequence!)).toContain('Listening on window')
    expect(tooltips(escape!)).toContain(
      'Listening on button id="save" class="primary, big" data-testid="save-button"',
    )
  })

  it('shows metadata as the row name and tooltip', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+S', () => {}, {
      ...options,
      meta: { name: 'Save', description: 'Write the file', group: 'File' },
    })
    manager.register('Mod+K', () => {}, options)
    const ui = mountPanel()
    const [save, plain] = rows(ui)
    expect(text(save!.querySelector('.hotkeyLabelName'))).toBe('Save')
    expect(text(save!.querySelector('.rowTooltipText'))).toBe(
      'File — Save — Write the file',
    )
    expect(save!.classList.contains('tooltip')).toBe(true)
    expect(plain!.querySelector('.hotkeyLabelName')).toBeNull()
    expect(plain!.querySelector('.rowTooltipText')).toBeNull()
  })

  it('counts triggers', () => {
    const callback = vi.fn()
    HotkeyManager.getInstance().register('K', callback, options)
    const ui = mountPanel()
    const row = () => rows(ui)[0]!
    expect(row().querySelector('.triggerCount')).toBeNull()
    press('keydown', 'k', 'KeyK')
    press('keyup', 'k', 'KeyK')
    press('keydown', 'k', 'KeyK')
    expect(callback).toHaveBeenCalledTimes(2)
    expect(text(row().querySelector('.triggerCount'))).toBe('x2')
  })

  it('pulses the row each time it fires', () => {
    vi.useFakeTimers()
    const callback = vi.fn()
    HotkeyManager.getInstance().register('K', callback, options)
    const ui = mountPanel()
    const row = () => rows(ui)[0]!
    expect(row().querySelector('.triggerCount')).toBeNull()

    press('keydown', 'k', 'KeyK')
    press('keyup', 'k', 'KeyK')
    expect(callback).toHaveBeenCalledOnce()
    expect(text(row().querySelector('.triggerCount'))).toBe('x1')
    expect(row().classList.contains('hotkeyRowTriggered')).toBe(true)
    vi.advanceTimersByTime(600)
    expect(row().classList.contains('hotkeyRowTriggered')).toBe(false)

    press('keydown', 'k', 'KeyK')
    press('keyup', 'k', 'KeyK')
    expect(text(row().querySelector('.triggerCount'))).toBe('x2')
  })

  it('restarts the pulse when the row fires again mid-pulse', () => {
    vi.useFakeTimers()
    HotkeyManager.getInstance().register('K', () => {}, options)
    const ui = mountPanel()
    const pulsing = () => rows(ui)[0]!.classList.contains('hotkeyRowTriggered')

    press('keydown', 'k', 'KeyK')
    press('keyup', 'k', 'KeyK')
    vi.advanceTimersByTime(400)
    press('keydown', 'k', 'KeyK')
    press('keyup', 'k', 'KeyK')
    vi.advanceTimersByTime(400)
    expect(pulsing()).toBe(true)
    vi.advanceTimersByTime(200)
    expect(pulsing()).toBe(false)
  })

  it('keeps row nodes, selection and scroll across registration updates', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('K', () => {}, options)
    const save = manager.register('Mod+S', () => {}, options)
    manager.register('Escape', () => {}, { ...options, scope: 'dialog' })
    const ui = mountPanel()
    const [k, s, escape] = rows(ui)
    click(s!)
    const list = ui.querySelector('.hotkeyList')!
    list.scrollTop = 40

    press('keydown', 'k', 'KeyK')
    press('keyup', 'k', 'KeyK')
    save.setOptions({ enabled: false })
    const added = manager.register('Mod+B', () => {}, options)

    expect(rows(ui).slice(0, 2)).toEqual([k, s])
    expect(rows(ui)).toContain(escape)
    expect(s!.classList.contains('hotkeyRowSelected')).toBe(true)
    expect(detailRows(ui).enabled).toBe('false')
    expect(ui.querySelector('.hotkeyList')).toBe(list)
    expect(list.scrollTop).toBe(40)

    added.unregister()
    expect(rows(ui)).toEqual([k, s, escape])
  })

  it('updates the enabled badge when options change', () => {
    const handle = HotkeyManager.getInstance().register(
      'Mod+S',
      () => {},
      options,
    )
    const ui = mountPanel()
    click(rows(ui)[0]!)
    expect(badges(rows(ui)[0]!)).toContain('on')
    expect(detailRows(ui).enabled).toBe('true')
    handle.setOptions({ enabled: false })
    expect(badges(rows(ui)[0]!)).toContain('off')
    expect(detailRows(ui).enabled).toBe('false')
  })
})

describe('scope groups', () => {
  const groups = (ui: Element) =>
    Array.from(ui.querySelectorAll('.scopeGroup'), (group) => ({
      scope: text(group.querySelector('.scopeName')),
      count: text(group.querySelector('.scopeCount')),
      status: text(
        group.querySelector('.scopeHeader .badge')?.firstChild as Element,
      ),
      dimmed: group.classList.contains('scopeGroupDimmed'),
    }))

  it('groups by scope in precedence order with live statuses', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+S', () => {}, options)
    manager.register('Escape', () => {}, { ...options, scope: 'dialog' })
    manager.register('Enter', () => {}, { ...options, scope: 'dialog' })
    manager.register('Mod+B', () => {}, { ...options, scope: 'editor' })
    manager.register('Mod+P', () => {}, { ...options, scope: 'unmounted' })
    const ui = mountPanel()
    expect(groups(ui)).toEqual([
      { scope: 'global scope', count: '1', status: 'active', dimmed: false },
      { scope: 'dialog scope', count: '2', status: 'inactive', dimmed: true },
      { scope: 'editor scope', count: '1', status: 'inactive', dimmed: true },
      {
        scope: 'unmounted scope',
        count: '1',
        status: 'inactive',
        dimmed: true,
      },
    ])

    manager.activateScope('editor')
    const release = manager.activateScope('dialog', { exclusive: true })
    expect(groups(ui).map((g) => [g.scope, g.status, g.dimmed])).toEqual([
      ['dialog scope', 'exclusive', false],
      ['editor scope', 'suspended', true],
      ['global scope', 'suspended', true],
      ['unmounted scope', 'inactive', true],
    ])

    release()
    expect(groups(ui).map((g) => [g.scope, g.status])).toEqual([
      ['editor scope', 'active'],
      ['global scope', 'active'],
      ['dialog scope', 'inactive'],
      ['unmounted scope', 'inactive'],
    ])
  })

  it('shows the scope status in the details', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Escape', () => {}, { ...options, scope: 'dialog' })
    const ui = mountPanel()
    click(rows(ui)[0]!)
    expect(detailRows(ui).scope).toBe('dialog (inactive)')
    const release = manager.activateScope('dialog')
    expect(detailRows(ui).scope).toBe('dialog (active)')
    release()
  })
})

describe('chord details', () => {
  it('lists every option with its effective value', () => {
    const manager = HotkeyManager.getInstance()
    const button = document.createElement('button')
    button.id = 'save'
    button.className = 'primary big'
    const handle = manager.register('Mod+S', () => {}, {
      ...options,
      target: button,
      eventType: 'keyup',
      preventDefault: 'always',
      stopPropagation: true,
      ignoreInputs: false,
      requireReset: true,
      meta: { name: 'Save', group: 'File' },
    })
    const ui = mountPanel()
    click(rows(ui)[0]!)
    expect(infoGrid(ui).Target).toBe('button#save.primary.big')
    expect(detailRows(ui)).toEqual({
      name: 'Save',
      description: '—',
      group: 'File',
      enabled: 'true',
      scope: 'global (active)',
      eventType: 'keyup',
      preventDefault: 'always',
      stopPropagation: 'true',
      ignoreInputs: 'false',
      requireReset: 'true',
      conflictBehavior: 'allow',
      hasFired: 'false',
    })
    expect(handle.id).toBe(infoGrid(ui).ID)
  })

  it('describes window and plain element targets', () => {
    const manager = HotkeyManager.getInstance()
    manager.register('Mod+S', () => {}, { ...options, target: window })
    manager.register('Mod+K', () => {}, {
      ...options,
      target: document.createElement('section'),
    })
    const ui = mountPanel()
    click(rows(ui)[0]!)
    expect(infoGrid(ui).Target).toBe('window')
    click(rows(ui)[1]!)
    expect(infoGrid(ui).Target).toBe('section')
  })

  it('shows defaults for a plain registration', () => {
    HotkeyManager.getInstance().register('Mod+S', () => {}, {
      platform: 'windows',
    })
    const ui = mountPanel()
    click(rows(ui)[0]!)
    expect(detailRows(ui)).toMatchObject({
      name: '—',
      description: '—',
      eventType: 'keydown',
      preventDefault: 'true',
      stopPropagation: 'true',
      ignoreInputs: 'auto',
      requireReset: 'false',
      conflictBehavior: 'warn',
    })
  })

  it('shows the requireReset latch once the key fires', () => {
    HotkeyManager.getInstance().register('K', () => {}, {
      ...options,
      requireReset: true,
    })
    const ui = mountPanel()
    click(rows(ui)[0]!)
    expect(detailRows(ui).hasFired).toBe('false')
    press('keydown', 'k', 'KeyK')
    expect(detailRows(ui).hasFired).toBe('true')
  })

  it('clears the requireReset latch when the key is released', () => {
    HotkeyManager.getInstance().register('K', () => {}, {
      ...options,
      requireReset: true,
    })
    const ui = mountPanel()
    click(rows(ui)[0]!)
    press('keydown', 'k', 'KeyK')
    expect(detailRows(ui).hasFired).toBe('true')
    press('keyup', 'k', 'KeyK')
    expect(detailRows(ui).hasFired).toBe('false')
  })

  it('shows the hotkey on every platform', () => {
    HotkeyManager.getInstance().register('Mod+Shift+S', () => {}, options)
    const ui = mountPanel()
    click(rows(ui)[0]!)
    const platforms = Object.fromEntries(
      Array.from(ui.querySelectorAll('.platformBreakdownRow'), (row) => [
        text(row.querySelector('.platformBreakdownLabel')),
        text(row.querySelector('.platformBreakdownPretty')),
      ]),
    )
    expect(platforms).toEqual({
      macOS: expect.stringMatching(/⌘|Cmd/),
      Windows: 'Ctrl+Shift+S',
      Linux: 'Ctrl+Shift+S',
    })
  })
})

describe('sequence details', () => {
  it('shows each step, its timeout, and the options', () => {
    HotkeyManager.getInstance().register(['G', '[KeyH]'], () => {}, {
      ...options,
      timeout: 750,
      meta: { name: 'Go home' },
    })
    const ui = mountPanel()
    click(rows(ui)[0]!)
    expect(infoGrid(ui)).toMatchObject({
      Matches: 'Mixed',
      Raw: 'G → [KeyH]',
      Target: 'document',
    })
    expect(
      Array.from(
        ui.querySelectorAll('.sequenceChordDetail > .keyBreakdownSubHeader'),
        text,
      ),
    ).toEqual(['Step 1 — Key', 'Step 2 — Code'])
    expect(detailRows(ui)).toMatchObject({
      name: 'Go home',
      timeout: '750ms',
      eventType: 'keydown',
      conflictBehavior: 'allow',
    })
  })

  it('shows extra metadata, non-default options, and conflicts', () => {
    const manager = HotkeyManager.getInstance()
    const first = manager.register(['G', 'H'], () => {}, {
      ...options,
      enabled: false,
      preventDefault: 'always',
      stopPropagation: false,
      ignoreInputs: false,
      target: window,
      meta: { name: 'Go home', group: 'Navigation' },
    })
    manager.register(['G', 'H'], () => {}, options)
    manager.register(['G', 'H'], () => {}, { ...options, scope: 'dialog' })
    first.setOptions({ enabled: true })
    const ui = mountPanel()
    click(rows(ui).find((row) => row.textContent?.includes('Go home'))!)
    expect(infoGrid(ui).Target).toBe('window')
    expect(detailRows(ui)).toMatchObject({
      group: 'Navigation',
      enabled: 'true',
      preventDefault: 'always',
      stopPropagation: 'false',
      ignoreInputs: 'false',
    })
    expect(
      Array.from(ui.querySelectorAll('.conflictList > div'), (item) =>
        text(item).replace(/\d+/g, '#'),
      ),
    ).toEqual([
      'overlap hotkey_#: G → H (keydown) on document',
      'scope hotkey_#: G → H (keydown) on document',
    ])
    expect(
      Array.from(ui.querySelectorAll('.detailSectionHeader'), text),
    ).toContain('Conflicts (2)')
  })

  it('follows option changes on the selected sequence', () => {
    const handle = HotkeyManager.getInstance().register(
      ['G', 'H'],
      () => {},
      options,
    )
    const ui = mountPanel()
    click(rows(ui)[0]!)
    expect(detailRows(ui).enabled).toBe('true')
    handle.setOptions({ enabled: false, timeout: 300 })
    expect(detailRows(ui)).toMatchObject({ enabled: 'false', timeout: '300ms' })
  })

  it('shows the default sequence timeout when none is set', () => {
    HotkeyManager.getInstance().register(['G', 'H'], () => {}, options)
    const ui = mountPanel()
    click(rows(ui)[0]!)
    expect(detailRows(ui).timeout).toBe('1000ms')
  })

  it('highlights matched steps while a sequence is in progress, then clears them after the timeout', () => {
    vi.useFakeTimers()
    const callback = vi.fn()
    HotkeyManager.getInstance().register(['G', 'H', 'J'], callback, {
      ...options,
      timeout: 500,
    })
    const ui = mountPanel()
    click(rows(ui)[0]!)
    const matched = () => ({
      row: rows(ui)[0]!.querySelectorAll('.sequenceStepMatched').length,
      title: details(ui).querySelectorAll('.stateTitle .sequenceStepMatched')
        .length,
      breakdown: details(ui).querySelectorAll('.keyCapLargeInProgress').length,
    })
    expect(matched()).toEqual({ row: 0, title: 0, breakdown: 0 })

    press('keydown', 'g', 'KeyG')
    press('keyup', 'g', 'KeyG')
    expect(matched()).toEqual({ row: 1, title: 1, breakdown: 1 })
    press('keydown', 'h', 'KeyH')
    press('keyup', 'h', 'KeyH')
    expect(matched()).toEqual({ row: 2, title: 2, breakdown: 2 })

    // No more keys: the panel's own clock expires the progress.
    vi.advanceTimersByTime(600)
    expect(matched()).toEqual({ row: 0, title: 0, breakdown: 0 })
    expect(callback).not.toHaveBeenCalled()
  })
})

describe('validation issues', () => {
  it('shows issues for a declared app hotkey', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const store = new AppHotkeysStore(
      defineAppHotkeys({ 'doc.close': { hotkey: 'Mod+escape' as never } }),
    )
    HotkeyManager.getInstance().appHotkeys.setState(() => store)
    const ui = mountPanel()
    click(ui.querySelector('.hotkeyRowInactive')!)
    expect(Array.from(ui.querySelectorAll('.issueItem'), text)).toEqual([
      "'escape' isn't a known key name, so the hotkey may never fire. Key names are case-sensitive, such as Escape and F1.",
    ])
  })
})
