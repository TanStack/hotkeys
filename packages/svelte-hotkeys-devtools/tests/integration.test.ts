import { HotkeyManager, KeyStateTracker } from '@tanstack/svelte-hotkeys'
import { mount, unmount } from 'svelte'
import { afterEach, expect, it, vi } from 'vitest'
import { HotkeysDevtoolsPanel } from '../src/SvelteHotkeysDevtools'
import { registerSave } from './integration-harness.svelte'

// No mocks: the real panel reads the manager the adapter registers with.
let host: HTMLDivElement
let panel: ReturnType<typeof mount> | undefined

const row = () =>
  Array.from(host.querySelectorAll('[data-row-label]')).find((label) =>
    label.textContent?.includes('Save file'),
  )?.parentElement

afterEach(async () => {
  if (panel) await unmount(panel)
  panel = undefined
  host.remove()
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

it('shows a createHotkey registration in the panel until its effect is destroyed', async () => {
  host = document.createElement('div')
  document.body.append(host)
  panel = mount(HotkeysDevtoolsPanel, { target: host })
  const destroy = registerSave()
  await vi.waitFor(() => expect(row()).toBeDefined(), { timeout: 5_000 })
  expect(row()!.querySelector('[data-row-label]')!.textContent).toBe(
    'Ctrl+SSave file',
  )
  expect(row()!.textContent).toContain('keyup')

  destroy()
  expect(row()).toBeUndefined()
  expect(host.textContent).toContain('Hotkeys (0)')
})
