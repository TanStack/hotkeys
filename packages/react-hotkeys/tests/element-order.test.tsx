import { afterEach, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { HotkeyManager } from '@tanstack/hotkeys'
import React, { useRef } from 'react'
import { useHotkey } from '../src/useHotkey'

// React runs onKeyDown from one listener on the root container, after native
// listeners on elements inside it.

const log: Array<string> = []

afterEach(() => {
  HotkeyManager.resetInstance()
  document.body.replaceChildren()
  log.length = 0
})

function Panel({ childStops = false }: { childStops?: boolean }) {
  const panelRef = useRef<HTMLDivElement>(null)
  useHotkey('Escape', () => log.push('hotkey'), { target: panelRef })
  return (
    <div ref={panelRef} tabIndex={0} onKeyDown={() => log.push('panel')}>
      <input
        role="combobox"
        aria-expanded="true"
        data-testid="child"
        onKeyDown={(event) => {
          log.push('child')
          if (childStops) event.stopPropagation()
        }}
      />
    </div>
  )
}

function press(element: Element) {
  element.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    }),
  )
}

it("runs an element target's hotkey after onKeyDown handlers inside it", () => {
  const { getByTestId } = render(<Panel />)
  const child = getByTestId('child')
  child.focus()
  press(child)
  expect(log).toEqual(['child', 'panel', 'hotkey'])
})

it('lets an onKeyDown handler inside the target stop the hotkey', () => {
  const { getByTestId } = render(<Panel childStops />)
  const child = getByTestId('child')
  child.focus()
  press(child)
  expect(log).toEqual(['child'])
})
