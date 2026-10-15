// @vitest-environment happy-dom
import { afterEach, expect, it } from 'vitest'
import { act, cleanup, render } from '@testing-library/preact'
import { KeyStateTracker } from '@tanstack/hotkeys'
import { useHotkeyHint } from '../src/useHotkeyHint'
import type { Hotkey } from '@tanstack/hotkeys'

afterEach(() => {
  cleanup()
  KeyStateTracker.resetInstance()
})
it('updates hints for held modifiers, changed bindings and blur', () => {
  function Hint({ binding }: { binding: Hotkey }) {
    return <span>{String(useHotkeyHint(binding))}</span>
  }
  const view = render(<Hint binding="Alt+[KeyS]" />)
  expect(view.container.textContent).toBe('false')
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Alt', code: 'AltLeft' }),
    )
  })
  expect(view.container.textContent).toBe('true')
  view.rerender(<Hint binding="Control+[KeyS]" />)
  expect(view.container.textContent).toBe('false')
  view.rerender(<Hint binding="Alt+[KeyS]" />)
  expect(view.container.textContent).toBe('true')
  act(() => {
    window.dispatchEvent(new Event('blur'))
  })
  expect(view.container.textContent).toBe('false')
})
