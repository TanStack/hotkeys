import {
  HotkeyManager,
  KeyStateTracker,
  useHotkey,
} from '@tanstack/react-hotkeys'
import React, { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { HotkeysDevtoolsPanel } from '../src/ReactHotkeysDevtools'
import type { Root } from 'react-dom/client'

// No mocks: the real panel reads the manager the adapter registers with.
let host: HTMLDivElement
let root: Root
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
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})
afterEach(async () => {
  await act(() => root.unmount())
  host.remove()
  vi.unstubAllGlobals()
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

it('shows a useHotkey registration in the panel until the component unmounts', async () => {
  await act(() => root.render(<App />))
  await vi.waitFor(() => expect(row()).toBeDefined())
  expect(row()!.querySelector('[data-row-label]')!.textContent).toBe(
    'Ctrl+SSave file',
  )
  expect(row()!.textContent).toContain('keyup')

  const panelInput = host.querySelector('input')
  await act(() => showSave(false))
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
  await act(() => root.render(<Parent />))
  await vi.waitFor(() => expect(host.querySelector('input')).not.toBeNull())
  const input = host.querySelector('input')!
  input.value = 'save'
  input.dispatchEvent(new Event('input', { bubbles: true }))

  await act(() => rerender())
  expect(host.querySelector('input')).toBe(input)
  expect(host.querySelector('input')!.value).toBe('save')
})
