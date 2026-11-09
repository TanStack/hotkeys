import {
  HotkeyManager,
  KeyStateTracker,
  useHotkey,
} from '@tanstack/vue-hotkeys'
import { afterEach, expect, it, vi } from 'vitest'
import { createApp, defineComponent, h, nextTick, ref } from 'vue'
import { HotkeysDevtoolsPanel } from '../src/VueHotkeysDevtools'
import type { App } from 'vue'

// No mocks: the real panel reads the manager the adapter registers with.
let host: HTMLDivElement
let app: App | undefined

const Save = defineComponent({
  setup() {
    useHotkey('Mod+S', () => {}, {
      platform: 'windows',
      eventType: 'keyup',
      meta: { name: 'Save file' },
    })
    return () => null
  },
})

const row = () =>
  Array.from(host.querySelectorAll('[data-row-label]')).find((label) =>
    label.textContent?.includes('Save file'),
  )?.parentElement

afterEach(() => {
  app?.unmount()
  app = undefined
  host.remove()
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

it('shows a useHotkey registration in the panel until the component unmounts', async () => {
  host = document.createElement('div')
  document.body.append(host)
  const show = ref(true)
  app = createApp({
    render: () => [h(HotkeysDevtoolsPanel), show.value ? h(Save) : null],
  })
  app.mount(host)
  await vi.waitFor(() => expect(row()).toBeDefined())
  expect(row()!.querySelector('[data-row-label]')!.textContent).toBe(
    'Ctrl+SSave file',
  )
  expect(row()!.textContent).toContain('keyup')

  show.value = false
  await nextTick()
  expect(row()).toBeUndefined()
  expect(host.textContent).toContain('Hotkeys (0)')
})
