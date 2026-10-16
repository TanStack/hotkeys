import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '../src/hotkey-manager'

// A key that continues or completes an in-progress sequence belongs to that
// sequence: chords for the same key press do not fire (issue #116).

afterEach(() => {
  HotkeyManager.resetInstance()
  document.body.replaceChildren()
  vi.useRealTimers()
})

function press(
  key: string,
  target: EventTarget = document,
  init: KeyboardEventInit = {},
) {
  const down = new KeyboardEvent('keydown', {
    key,
    code: /^[a-z]$/i.test(key) ? `Key${key.toUpperCase()}` : key,
    bubbles: true,
    cancelable: true,
    ...init,
  })
  target.dispatchEvent(down)
  target.dispatchEvent(
    new KeyboardEvent('keyup', {
      key,
      code: down.code,
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  )
  return down
}

function setup() {
  const manager = HotkeyManager.getInstance()
  const chord = vi.fn()
  const sequence = vi.fn()
  return { manager, chord, sequence }
}

describe('a sequence owns the keys after its first step', () => {
  it('does not fire a chord for the key that completes a sequence', () => {
    const { manager, chord, sequence } = setup()
    manager.register('C', chord)
    manager.register(['G', 'C'], sequence)

    press('g')
    press('c')
    expect(sequence).toHaveBeenCalledOnce()
    expect(chord).not.toHaveBeenCalled()

    // Without a pending sequence, the chord fires as usual
    press('c')
    expect(chord).toHaveBeenCalledOnce()
  })

  it('does not depend on registration order', () => {
    const { manager, chord, sequence } = setup()
    manager.register(['G', 'C'], sequence)
    manager.register('C', chord)

    press('g')
    press('c')
    expect(sequence).toHaveBeenCalledOnce()
    expect(chord).not.toHaveBeenCalled()
  })

  it('does not fire a chord for a middle step of a sequence', () => {
    const { manager, chord, sequence } = setup()
    manager.register('C', chord)
    manager.register(['G', 'C', 'X'], sequence)

    press('g')
    press('c')
    expect(chord).not.toHaveBeenCalled()
    press('x')
    expect(sequence).toHaveBeenCalledOnce()
  })

  it('still fires a chord on the first step of a sequence', () => {
    const { manager, chord, sequence } = setup()
    manager.register('G', chord)
    manager.register(['G', 'C'], sequence)

    press('g')
    expect(chord).toHaveBeenCalledOnce()
    press('c')
    expect(sequence).toHaveBeenCalledOnce()
  })

  it('does not fire a first-step chord when the same key continues a sequence', () => {
    const { manager, chord, sequence } = setup()
    manager.register('G', chord)
    manager.register(['G', 'G'], sequence)

    press('g')
    press('g')
    expect(chord).toHaveBeenCalledOnce()
    expect(sequence).toHaveBeenCalledOnce()

    // The sequence starts over, so the next G is a first step again
    press('g')
    expect(chord).toHaveBeenCalledTimes(2)
  })

  it('does not fire a chord while the completing key repeats', () => {
    const { manager, chord, sequence } = setup()
    manager.register('C', chord)
    manager.register(['G', 'C'], sequence)

    press('g')
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'c', code: 'KeyC', bubbles: true }),
    )
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'c',
        code: 'KeyC',
        repeat: true,
        bubbles: true,
      }),
    )
    expect(sequence).toHaveBeenCalledOnce()
    expect(chord).not.toHaveBeenCalled()
  })

  it('does not apply the chord preventDefault to a key the sequence owns', () => {
    const { manager, chord, sequence } = setup()
    manager.register('C', chord, { preventDefault: true })
    manager.register(['G', 'C'], sequence, { preventDefault: false })

    press('g')
    expect(press('c').defaultPrevented).toBe(false)
  })

  it('fires a chord whose modifiers do not match the next step', () => {
    const { manager, chord, sequence } = setup()
    manager.register('Shift+C', chord)
    manager.register(['G', 'C'], sequence)

    press('g')
    press('C', document, { shiftKey: true })
    expect(chord).toHaveBeenCalledOnce()
    expect(sequence).not.toHaveBeenCalled()
  })

  it('fires the chord once a pending sequence times out', () => {
    vi.useFakeTimers()
    const { manager, chord, sequence } = setup()
    manager.register('C', chord)
    manager.register(['G', 'C'], sequence, { timeout: 500 })

    press('g')
    vi.advanceTimersByTime(600)
    press('c')
    expect(chord).toHaveBeenCalledOnce()
    expect(sequence).not.toHaveBeenCalled()
  })

  it('ignores disabled sequences', () => {
    const { manager, chord, sequence } = setup()
    manager.register('C', chord)
    const handle = manager.register(['G', 'C'], sequence)

    press('g')
    handle.setOptions({ enabled: false })
    press('c')
    expect(chord).toHaveBeenCalledOnce()
  })

  it('ignores a sequence that skips keys typed in an input', () => {
    const { manager, chord, sequence } = setup()
    const input = document.createElement('input')
    document.body.append(input)
    manager.register('C', chord, { ignoreInputs: false })
    manager.register(['G', 'C'], sequence)

    press('g')
    input.focus()
    press('c', input)
    expect(sequence).not.toHaveBeenCalled()
    expect(chord).toHaveBeenCalledOnce()
  })

  it('applies to a chord on an element inside the sequence target', () => {
    const { manager, chord, sequence } = setup()
    const button = document.createElement('button')
    document.body.append(button)
    manager.register('X', chord, { target: button })
    manager.register(['G', 'X'], sequence)

    press('g', button)
    press('x', button)
    expect(sequence).toHaveBeenCalledOnce()
    expect(chord).not.toHaveBeenCalled()
  })

  it('applies to a capture-phase chord', () => {
    const { manager, chord, sequence } = setup()
    manager.register('C', chord, { capture: true })
    manager.register(['G', 'C'], sequence)

    press('g')
    press('c')
    expect(sequence).toHaveBeenCalledOnce()
    expect(chord).not.toHaveBeenCalled()
  })

  it('ignores a sequence whose target the event does not reach', () => {
    const { manager, chord, sequence } = setup()
    const panel = document.createElement('div')
    const outside = document.createElement('div')
    panel.tabIndex = 0
    outside.tabIndex = 0
    document.body.append(panel, outside)
    manager.register('C', chord)
    manager.register(['G', 'C'], sequence, { target: panel })

    press('g', panel)
    press('c', outside)
    expect(sequence).not.toHaveBeenCalled()
    expect(chord).toHaveBeenCalledOnce()
  })

  it('applies to chords handled on keyup', () => {
    const { manager, chord, sequence } = setup()
    manager.register('C', chord, { eventType: 'keyup' })
    manager.register(['G', 'C'], sequence)

    press('g')
    press('c')
    expect(sequence).toHaveBeenCalledOnce()
    expect(chord).not.toHaveBeenCalled()
  })

  it('applies to sequences that advance on keyup', () => {
    const { manager, chord, sequence } = setup()
    manager.register('C', chord, { eventType: 'keyup' })
    manager.register(['G', 'C'], sequence, { eventType: 'keyup' })

    press('g')
    press('c')
    expect(sequence).toHaveBeenCalledOnce()
    expect(chord).not.toHaveBeenCalled()
  })

  it('releases a key whose keyup was missed on its next press', () => {
    const { manager, chord, sequence } = setup()
    manager.register('C', chord)
    manager.register(['G', 'C'], sequence)

    press('g')
    // The keyup for C never arrives, for example after the window loses focus
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'c', code: 'KeyC', bubbles: true }),
    )
    expect(sequence).toHaveBeenCalledOnce()

    press('c')
    expect(chord).toHaveBeenCalledOnce()
  })

  it('applies to each registration of a key, not only the first', () => {
    const { manager, sequence } = setup()
    const first = vi.fn()
    const second = vi.fn()
    manager.register('C', first)
    manager.register('C', second, { conflictBehavior: 'allow' })
    manager.register(['G', 'C'], sequence)

    press('g')
    press('c')
    expect(sequence).toHaveBeenCalledOnce()
    expect(first).not.toHaveBeenCalled()
    expect(second).not.toHaveBeenCalled()
  })
})
