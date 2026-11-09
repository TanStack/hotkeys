import {
  HotkeyManager,
  KeyStateTracker,
  useHotkey,
} from '@tanstack/preact-hotkeys'
import { render } from 'preact'
import { useState } from 'preact/hooks'
import { act } from 'preact/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { HotkeysDevtoolsPanel } from '../src/PreactHotkeysDevtools'

// No mocks: the real panel reads the manager the adapter registers with.
let host: HTMLDivElement
let showSave: (show: boolean) => void

function Save() {
  useHotkey('Mod+S', () => {}, {
    platform: 'windows',
    eventType: 'keyup',
    meta: { name: 'Save file' },
  })
  return null
}

/** Owns the toggle, so hiding Save doesn't re-render the panel (see BUG-112). */
function SaveToggle() {
  const [show, setShow] = useState(true)
  showSave = setShow
  return show ? <Save /> : null
}

function App() {
  return (
    <>
      <HotkeysDevtoolsPanel />
      <SaveToggle />
    </>
  )
}

const row = () =>
  Array.from(host.querySelectorAll('[data-row-label]')).find((label) =>
    label.textContent?.includes('Save file'),
  )?.parentElement

beforeEach(() => {
  host = document.createElement('div')
  document.body.append(host)
})
afterEach(() => {
  act(() => render(null, host))
  host.remove()
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

it('shows a useHotkey registration in the panel until the component unmounts', async () => {
  act(() => render(<App />, host))
  await vi.waitFor(() => expect(row()).toBeDefined(), { timeout: 5_000 })
  expect(row()!.querySelector('[data-row-label]')!.textContent).toBe(
    'Ctrl+SSave file',
  )
  expect(row()!.textContent).toContain('keyup')

  const panelInput = host.querySelector('input')
  act(() => showSave(false))
  expect(row()).toBeUndefined()
  expect(host.textContent).toContain('Hotkeys (0)')
  // The panel updated in place instead of remounting.
  expect(host.querySelector('input')).toBe(panelInput)
})

// BUG-112 draft: issues/bugs/BUG-112-standalone-panel-remounts-on-parent-render.md
it.skip('BUG-112: keeps panel state when the parent re-renders', async () => {
  let rerender!: () => void
  function Parent() {
    const [, setCount] = useState(0)
    rerender = () => setCount((count) => count + 1)
    return <HotkeysDevtoolsPanel />
  }
  act(() => render(<Parent />, host))
  await vi.waitFor(() => expect(host.querySelector('input')).not.toBeNull(), {
    timeout: 5_000,
  })
  const input = host.querySelector('input')!
  input.value = 'save'
  input.dispatchEvent(new Event('input', { bubbles: true }))

  act(() => rerender())
  await new Promise((resolve) => setTimeout(resolve, 50))
  expect(host.querySelector('input')).toBe(input)
  expect(host.querySelector('input')!.value).toBe('save')
})
