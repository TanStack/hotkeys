import morph from '@alpinejs/morph'
import Alpine from 'alpinejs'
import { afterEach, describe, expect, it } from 'vitest'
import { HotkeyManager, getHotkeyManager, hotkeyDirective } from '../src'
import { hotkeyFromModifiers } from '../src/hotkeyDirective'

Alpine.plugin(morph)
Alpine.plugin(hotkeyDirective)
// Alpine sees attribute changes, such as a morph's, only once started.
Alpine.start()

const morphTo = (from: Element, to: string) =>
  (Alpine as unknown as { morph: (from: Element, to: string) => void }).morph(
    from,
    to,
  )

function key(key: string, options: KeyboardEventInit = {}) {
  document.body.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
      ...options,
    }),
  )
}

async function mount(html: string) {
  document.body.innerHTML = html
  // Alpine initializes added elements from its mutation observer.
  await Alpine.nextTick()
  return document.body.firstElementChild as HTMLElement
}

function registered() {
  return [...getHotkeyManager().registrations.state.values()].map(
    (registration) => registration.hotkey,
  )
}

afterEach(async () => {
  document.body.replaceChildren()
  await Alpine.nextTick()
  HotkeyManager.resetInstance()
})

describe('hotkeyFromModifiers', () => {
  it('reads chords, named keys, and sequences', () => {
    expect(hotkeyFromModifiers(['mod', 's'])).toBe('Mod+S')
    expect(hotkeyFromModifiers(['control', 'shift', 'k'])).toBe(
      'Control+Shift+K',
    )
    expect(hotkeyFromModifiers(['escape'])).toBe('Escape')
    expect(hotkeyFromModifiers(['arrow-up'])).toBe('ArrowUp')
    expect(hotkeyFromModifiers(['shift', 'f10'])).toBe('Shift+F10')
    expect(hotkeyFromModifiers(['g', 'h'])).toEqual(['G', 'H'])
    expect(hotkeyFromModifiers(['mod', 'k', 'mod', 's'])).toEqual([
      'Mod+K',
      'Mod+S',
    ])
    expect(hotkeyFromModifiers([])).toBeUndefined()
  })

  it('keeps a letter that uppercases to another key', () => {
    // `ı` uppercases to the ASCII `I` and `ß` to `SS`, as core keeps them.
    expect(hotkeyFromModifiers(['mod', 'ı'])).toBe('Mod+ı')
    expect(hotkeyFromModifiers(['ß'])).toBe('ß')
    expect(hotkeyFromModifiers(['é'])).toBe('É')
  })

  it('reads nothing when a modifier comes after the last key', () => {
    // `x-hotkey.s.mod` must not register a bare `S`.
    expect(hotkeyFromModifiers(['s', 'mod'])).toBeUndefined()
    expect(hotkeyFromModifiers(['g', 'h', 'shift'])).toBeUndefined()
  })
})

describe('x-hotkey', () => {
  it('runs its expression with $event and unregisters with its element', async () => {
    const element = await mount(
      `<div x-data="{ count: 0, key: '' }" x-hotkey.control.s="count++; key = $event.key"></div>`,
    )
    key('s', { ctrlKey: true })
    const data = Alpine.$data(element) as { count: number; key: string }
    expect(data.count).toBe(1)
    expect(data.key).toBe('s')
    element.remove()
    await Alpine.nextTick()
    expect(getHotkeyManager().registrations.state.size).toBe(0)
  })

  it('registers sequences', async () => {
    const element = await mount(
      `<div x-data="{ count: 0 }" x-hotkey.g.h="count++"></div>`,
    )
    key('g')
    key('h')
    expect((Alpine.$data(element) as { count: number }).count).toBe(1)
  })

  it('follows a morph that changes the binding', async () => {
    const element = await mount(
      `<div x-data="{ calls: [] }"><span x-hotkey.control.s="calls.push('S')"></span></div>`,
    )
    expect(registered()).toEqual(['Control+S'])
    morphTo(
      element,
      `<div x-data="{ calls: [] }"><span x-hotkey.control.p="calls.push('P')"></span></div>`,
    )
    await Alpine.nextTick()
    expect(registered()).toEqual(['Control+P'])
    key('s', { ctrlKey: true })
    key('p', { ctrlKey: true })
    expect((Alpine.$data(element) as { calls: Array<string> }).calls).toEqual([
      'P',
    ])
  })

  it('unregisters when a morph removes the attribute', async () => {
    const element = await mount(
      `<div x-data><span x-hotkey.control.s="1"></span></div>`,
    )
    morphTo(element, `<div x-data><span></span></div>`)
    await Alpine.nextTick()
    expect(getHotkeyManager().registrations.state.size).toBe(0)
  })

  it('keeps one registration through a morph that changes nothing', async () => {
    const html = `<div x-data><span x-hotkey.control.s="1"></span></div>`
    const element = await mount(html)
    morphTo(element, html)
    await Alpine.nextTick()
    expect(registered()).toEqual(['Control+S'])
  })
})
