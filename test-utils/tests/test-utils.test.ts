import { afterEach, describe, expect, it } from 'vitest'
import {
  USER_AGENTS,
  keydown,
  keyup,
  setTestPlatform,
  testPlatform,
  withAltGraph,
} from '../src'

describe('setup', () => {
  afterEach(() => setTestPlatform(testPlatform()))

  it('pins the user agent to the HOTKEYS_TEST_PLATFORM platform', () => {
    expect(navigator.userAgent).toBe(USER_AGENTS[testPlatform()])
  })

  it.each(['mac', 'windows', 'linux'] as const)(
    'setTestPlatform(%s) also sets navigator.platform',
    (platform) => {
      setTestPlatform(platform)
      expect(navigator.userAgent).toBe(USER_AGENTS[platform])
      const expected = { mac: /mac/i, windows: /win/i, linux: /linux/i }
      expect(navigator.platform).toMatch(expected[platform])
    },
  )

  it('does not report Alt as AltGraph', () => {
    const event = new KeyboardEvent('keydown', { key: 'a', altKey: true })
    expect(event.getModifierState('AltGraph')).toBe(false)
    expect(event.getModifierState('Alt')).toBe(true)
  })

  it('reports AltGraph only when the event is marked', () => {
    const event = withAltGraph(new KeyboardEvent('keydown', { key: '@' }))
    expect(event.getModifierState('AltGraph')).toBe(true)
    expect(event.getModifierState('Alt')).toBe(false)
  })
})

describe('keydown and keyup', () => {
  it('creates bubbling, cancelable events with the given fields', () => {
    const event = keydown({
      key: 'S',
      code: 'KeyS',
      ctrlKey: true,
      shiftKey: true,
      repeat: true,
      isComposing: true,
      keyCode: 229,
    })
    expect(event.type).toBe('keydown')
    expect(event).toMatchObject({
      key: 'S',
      code: 'KeyS',
      ctrlKey: true,
      shiftKey: true,
      altKey: false,
      metaKey: false,
      repeat: true,
      isComposing: true,
      keyCode: 229,
      bubbles: true,
      cancelable: true,
    })
    expect(keyup({ key: 'S' }).type).toBe('keyup')
  })

  it('sets AltGraph from the altGraph option', () => {
    expect(
      keydown({ key: '@', altGraph: true }).getModifierState('AltGraph'),
    ).toBe(true)
    expect(
      keydown({ key: 'a', altKey: true }).getModifierState('AltGraph'),
    ).toBe(false)
  })

  it('dispatches on the target when one is given', () => {
    const target = document.createElement('input')
    document.body.append(target)
    const seen: Array<string> = []
    document.addEventListener('keydown', (e) => seen.push(e.key), {
      once: true,
    })
    const event = keydown({ key: 'Enter', target })
    expect(seen).toEqual(['Enter'])
    expect(event.target).toBe(target)
    target.remove()
  })
})

describe('KeyboardEvent constructor', () => {
  it('reads the standard modifierAltGraph init field', () => {
    const event = new KeyboardEvent('keydown', {
      key: '@',
      ctrlKey: true,
      altKey: true,
      modifierAltGraph: true,
    })
    expect(event.getModifierState('AltGraph')).toBe(true)
    expect(event.ctrlKey && event.altKey).toBe(true)
  })

  it('keeps instanceof working for events made by the original class', () => {
    const Original = Object.getPrototypeOf(
      KeyboardEvent,
    ) as typeof KeyboardEvent
    const event = new Original('keydown', { key: 'a', altKey: true })
    expect(event).toBeInstanceOf(KeyboardEvent)
    expect(event.getModifierState('AltGraph')).toBe(false)
    expect(document.defaultView?.KeyboardEvent).toBe(KeyboardEvent)
  })
})
