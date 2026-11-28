// @vitest-environment happy-dom

import { render } from '@solidjs/testing-library'
import { Portal } from '@solidjs/web'
import { HotkeyManager } from '@tanstack/hotkeys'
import { createSignal } from 'solid-js'
import { afterEach, expect, it } from 'vitest'
import { createHotkey } from '../src/createHotkey'

// A Portal whose `mount` changes moves the same nodes to the new mount, and
// refs don't run again. Moving into another document, such as a
// Picture-in-Picture window, must not stop the element's hotkeys.

afterEach(() => {
  HotkeyManager.resetInstance()
  document.body.replaceChildren()
})

it("keeps an element's hotkey after a Portal moves it into another document", async () => {
  const log: Array<string> = []
  const other = document.implementation.createHTMLDocument()
  const [mount, setMount] = createSignal<HTMLElement>(document.body)

  function Panel() {
    const [panel, setPanel] = createSignal<HTMLDivElement | null>(null)
    createHotkey(
      'K',
      () => log.push('hotkey'),
      () => ({ target: panel() }),
    )
    return (
      <div ref={setPanel} tabindex={0}>
        <button data-testid="child">child</button>
      </div>
    )
  }

  render(() => (
    <Portal mount={mount()}>
      <Panel />
    </Portal>
  ))
  const child = document.querySelector('[data-testid="child"]')!
  const press = () =>
    child.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', bubbles: true }),
    )
  press()
  setMount(other.body)
  await Promise.resolve()

  expect(child.ownerDocument).toBe(other)
  press()

  expect(log).toEqual(['hotkey', 'hotkey'])
})
