import {
  HotkeyManager,
  KeyStateTracker,
  createHotkey,
} from '@tanstack/solid-hotkeys'
import { Show, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { afterEach, expect, it, vi } from 'vitest'
import { HotkeysDevtoolsPanel } from '../src/SolidHotkeysDevtools'

// No mocks: the real panel reads the manager the adapter registers with.
let host: HTMLDivElement
let dispose: (() => void) | undefined

function Save() {
  createHotkey('Mod+S', () => {}, {
    platform: 'windows',
    eventType: 'keyup',
    meta: { name: 'Save file' },
  })
  return null
}

const row = () =>
  Array.from(host.querySelectorAll('[data-row-label]')).find((label) =>
    label.textContent?.includes('Save file'),
  )?.parentElement

afterEach(() => {
  dispose?.()
  dispose = undefined
  host.remove()
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

it('shows a createHotkey registration in the panel until its owner is disposed', async () => {
  host = document.createElement('div')
  document.body.append(host)
  const [show, setShow] = createSignal(true)
  dispose = render(
    () => (
      <>
        <HotkeysDevtoolsPanel />
        <Show when={show()}>
          <Save />
        </Show>
      </>
    ),
    host,
  )
  await vi.waitFor(() => expect(row()).toBeDefined())
  expect(row()!.querySelector('[data-row-label]')!.textContent).toBe(
    'Ctrl+SSave file',
  )
  expect(row()!.textContent).toContain('keyup')

  setShow(false)
  expect(row()).toBeUndefined()
  expect(host.textContent).toContain('Hotkeys (0)')
})
