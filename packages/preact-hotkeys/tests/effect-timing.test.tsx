// @vitest-environment happy-dom

import { HotkeyManager } from '@tanstack/hotkeys'
import { act, cleanup, render } from '@testing-library/preact'
import { useRef, useState } from 'preact/hooks'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useHotkey } from '../src/useHotkey'

// Dispatched outside act(), like events from other scripts, so Preact renders
// on its own schedule.
function press(key: string) {
  document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  document.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
}

// One task: Preact renders, but runs plain effects only after paint.
const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0))

function Dialog({ onClose }: { onClose: () => void }) {
  useHotkey('Escape', onClose)
  return <div data-testid="dialog" />
}

function Page({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false)
  useHotkey('O', () => setOpen(true))
  return open ? (
    <Dialog
      onClose={() => {
        onClose()
        setOpen(false)
      }}
    />
  ) : null
}

describe('effect timing', () => {
  afterEach(() => {
    cleanup()
    HotkeyManager.resetInstance()
  })

  it('registers a hotkey before the next event', async () => {
    const onClose = vi.fn()
    const { queryByTestId } = render(<Page onClose={onClose} />)

    press('o')
    await nextTask()
    expect(queryByTestId('dialog')).not.toBeNull()
    press('Escape')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('unregisters an unmounted hotkey before the next event', async () => {
    const onClose = vi.fn()
    const { queryByTestId } = render(<Page onClose={onClose} />)
    act(() => press('o'))
    expect(queryByTestId('dialog')).not.toBeNull()

    press('Escape')
    expect(onClose).toHaveBeenCalledTimes(1)
    await nextTask()
    expect(queryByTestId('dialog')).toBeNull()
    press('Escape')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('a ref target on an ancestor element', () => {
  afterEach(() => {
    cleanup()
    HotkeyManager.resetInstance()
  })

  it('registers once the ancestor attaches its ref', () => {
    const fired: Array<string> = []
    function Child({ target }: { target: { current: HTMLDivElement | null } }) {
      useHotkey('K', () => fired.push('K'), { target })
      return null
    }
    function Panel() {
      const ref = useRef<HTMLDivElement>(null)
      return (
        <div ref={ref} tabIndex={0} data-testid="panel">
          <Child target={ref} />
        </div>
      )
    }
    const { getByTestId } = render(<Panel />)
    getByTestId('panel').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', bubbles: true }),
    )
    expect(fired).toEqual(['K'])
  })
})
