// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, render } from '@testing-library/react'
import React, { useState } from 'react'
import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useHotkey } from '../src/useHotkey'
import { useHotkeyHint } from '../src/useHotkeyHint'
import { useHotkeys } from '../src/useHotkeys'
import type { Hotkey } from '@tanstack/hotkeys'

function pressCtrlS(target: EventTarget = document.body) {
  let reachedWindow = false
  const listener = () => (reachedWindow = true)
  window.addEventListener('keydown', listener)
  const event = new KeyboardEvent('keydown', {
    key: 's',
    code: 'KeyS',
    ctrlKey: true,
    bubbles: true,
    cancelable: true,
  })
  target.dispatchEvent(event)
  window.removeEventListener('keydown', listener)
  return { defaultPrevented: event.defaultPrevented, reachedWindow }
}

function registrationCount() {
  return getHotkeyManager().registrations.state.size
}

beforeEach(() => HotkeyManager.resetInstance())
afterEach(() => {
  cleanup()
  HotkeyManager.resetInstance()
})

describe('unset options', () => {
  function Shortcut(props: {
    hotkey: Hotkey
    onRun: () => void
    preventDefault?: boolean
    stopPropagation?: boolean
  }) {
    useHotkey(props.hotkey, props.onRun, {
      platform: 'windows',
      preventDefault: props.preventDefault,
      stopPropagation: props.stopPropagation,
    })
    return null
  }

  it('keep the defaults when a wrapper forwards unset props', () => {
    const onRun = vi.fn()
    render(<Shortcut hotkey="Mod+S" onRun={onRun} />)
    expect(pressCtrlS()).toEqual({
      defaultPrevented: true,
      reachedWindow: false,
    })
    expect(onRun).toHaveBeenCalledOnce()
  })

  it('keep the provider defaults', () => {
    render(
      <HotkeysProvider defaultOptions={{ hotkey: { preventDefault: false } }}>
        <Shortcut hotkey="Mod+S" onRun={() => {}} />
      </HotkeysProvider>,
    )
    expect(pressCtrlS().defaultPrevented).toBe(false)
  })
})

describe('null targets', () => {
  it('register nothing', () => {
    function Panel() {
      useHotkey('Escape', () => {}, { target: null })
      return null
    }
    render(<Panel />)
    expect(registrationCount()).toBe(0)
  })

  it('register on the element once a callback ref sets it', () => {
    const onClose = vi.fn()
    let show: () => void = () => {}
    function Panel() {
      const [element, setElement] = useState<HTMLDivElement | null>(null)
      const [visible, setVisible] = useState(false)
      show = () => setVisible(true)
      useHotkey('Escape', onClose, { target: element })
      return visible ? <div ref={setElement} tabIndex={0} /> : null
    }
    const { container } = render(<Panel />)
    expect(registrationCount()).toBe(0)
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    expect(onClose).not.toHaveBeenCalled()
    act(() => show())
    const panel = container.querySelector('div')!
    expect(
      [...getHotkeyManager().registrations.state.values()][0]!.target,
    ).toBe(panel)
    panel.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    expect(onClose).toHaveBeenCalledOnce()
  })
})

describe('empty hotkeys', () => {
  it('register nothing, and clearing a hotkey unregisters it', () => {
    const onRun = vi.fn()
    function Shortcut(props: { hotkey: string }) {
      useHotkey(props.hotkey as Hotkey, onRun)
      return null
    }
    const { rerender } = render(<Shortcut hotkey="K" />)
    expect(registrationCount()).toBe(1)
    rerender(<Shortcut hotkey="" />)
    expect(registrationCount()).toBe(0)
    document.dispatchEvent(new Event('keydown'))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))
    expect(onRun).not.toHaveBeenCalled()
  })
})

describe('nullish hotkeys', () => {
  function Shortcut(props: { shortcut?: Hotkey | null; onRun: () => void }) {
    useHotkey(props.shortcut, props.onRun)
    const hint = useHotkeyHint(props.shortcut)
    return <span data-hint={String(hint)} />
  }

  it('register nothing, and a hotkey that becomes undefined unregisters', () => {
    const onRun = vi.fn()
    const { rerender, container } = render(<Shortcut onRun={onRun} />)
    expect(registrationCount()).toBe(0)
    expect(container.querySelector('span')!.dataset.hint).toBe('false')
    rerender(<Shortcut shortcut="K" onRun={onRun} />)
    expect(registrationCount()).toBe(1)
    rerender(<Shortcut shortcut={null} onRun={onRun} />)
    expect(registrationCount()).toBe(0)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))
    expect(onRun).not.toHaveBeenCalled()
    rerender(<Shortcut shortcut="K" onRun={onRun} />)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))
    expect(onRun).toHaveBeenCalledOnce()
  })

  it('skip nullish definitions in useHotkeys', () => {
    const shortcuts: Array<Hotkey | undefined> = ['A', undefined, 'B']
    function List() {
      useHotkeys(shortcuts.map((hotkey) => ({ hotkey, callback: () => {} })))
      return null
    }
    render(<List />)
    expect(registrationCount()).toBe(2)
  })
})
