import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing'
import {
  HotkeyManager,
  KeyStateTracker,
  injectHotkey,
} from '@tanstack/angular-hotkeys'
import { afterEach, beforeAll, expect, it, vi } from 'vitest'
import { HotkeysDevtoolsPanel } from '../src/AngularHotkeysDevtools'

// No mocks: the real panel reads the manager the adapter registers with.
let host: HTMLDivElement
let cleanup: (() => void) | undefined

const row = () =>
  Array.from(host.querySelectorAll('[data-row-label]')).find((label) =>
    label.textContent?.includes('Save file'),
  )?.parentElement

beforeAll(() => {
  TestBed.initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting(),
  )
})
afterEach(() => {
  cleanup?.()
  cleanup = undefined
  TestBed.resetTestingModule()
  host.remove()
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})

it('shows an injectHotkey registration in the panel until its injector is destroyed', async () => {
  host = document.createElement('div')
  document.body.append(host)
  cleanup = HotkeysDevtoolsPanel()(() => ({}), host)
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  })
  TestBed.runInInjectionContext(() => {
    injectHotkey('Mod+S', () => {}, {
      platform: 'windows',
      eventType: 'keyup',
      meta: { name: 'Save file' },
    })
  })
  TestBed.flushEffects()
  await vi.waitFor(() => expect(row()).toBeDefined(), { timeout: 5_000 })
  expect(row()!.querySelector('[data-row-label]')!.textContent).toBe(
    'Ctrl+SSave file',
  )
  expect(row()!.textContent).toContain('keyup')

  TestBed.resetTestingModule()
  expect(row()).toBeUndefined()
  expect(host.textContent).toContain('Hotkeys (0)')
})
