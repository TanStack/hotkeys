// @vitest-environment happy-dom
import { afterEach, expect, it } from 'vitest'
import { render } from '@solidjs/testing-library'
import { clearDelegatedEvents, delegateEvents } from 'solid-js/web'
import { createSignal } from 'solid-js'
import { HotkeyManager } from '@tanstack/hotkeys'
import { createHotkey } from '../src/createHotkey'

// Solid runs onKeyDown from one listener on the document. A hotkey must run
// after it, even when the hotkey's listener was added first.

const log: Array<string> = []

afterEach(() => {
  HotkeyManager.resetInstance()
  document.body.replaceChildren()
  delegateEvents(['keydown', 'keyup'])
  log.length = 0
})

function press(element: Element, key = 'Escape') {
  element.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
  )
}

function Panel(props: { childStops?: boolean }) {
  const [panel, setPanel] = createSignal<HTMLDivElement | null>(null)
  createHotkey(
    'Escape',
    () => log.push('hotkey'),
    () => ({ target: panel() }),
  )
  return (
    <div ref={setPanel} tabIndex={0} onKeyDown={() => log.push('panel')}>
      <input
        role="combobox"
        aria-expanded="true"
        data-testid="child"
        onKeyDown={(event) => {
          log.push('child')
          if (props.childStops) event.stopPropagation()
        }}
      />
    </div>
  )
}

it("runs an element target's hotkey after onKeyDown handlers inside it", () => {
  const { getByTestId } = render(() => <Panel />)
  const child = getByTestId('child')
  child.focus()
  press(child)
  expect(log).toEqual(['child', 'panel', 'hotkey'])
})

it('lets an onKeyDown handler inside the target stop the hotkey', () => {
  const { getByTestId } = render(() => <Panel childStops />)
  const child = getByTestId('child')
  child.focus()
  press(child)
  expect(log).toEqual(['child'])
})

it('runs a document hotkey after onKeyDown handlers that load later', () => {
  // A route chunk that first uses onKeyDown loads after the hotkey registers.
  clearDelegatedEvents()
  function Root() {
    createHotkey('J', () => log.push('hotkey'))
    return null
  }
  render(() => <Root />)
  delegateEvents(['keydown'])
  const { getByTestId } = render(() => (
    <button
      data-testid="child"
      onKeyDown={(event) => {
        log.push('child')
        event.stopPropagation()
      }}
    />
  ))
  const child = getByTestId('child')
  child.focus()
  press(child, 'j')
  expect(log).toEqual(['child'])
})
