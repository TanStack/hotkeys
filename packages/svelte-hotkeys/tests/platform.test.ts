import { flushSync, mount, unmount } from 'svelte'
import { HotkeyManager } from '@tanstack/hotkeys'
import { afterEach, describe, expect, it, vi } from 'vitest'
import PlatformHarness from './PlatformHarness.svelte'
import type { SvelteHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'

type Platform = 'mac' | 'windows' | 'linux'

function press(init: KeyboardEventInit) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 's', bubbles: true, ...init }),
  )
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key: 's', bubbles: true, ...init }),
  )
}

function setup(
  initial: Platform,
  options: { hotkeyPlatform?: Platform; labelPlatform?: Platform } = {},
) {
  const onHotkey = vi.fn()
  const onRecord = vi.fn()
  let recorder!: SvelteHotkeyRecorder
  let setPlatform!: (platform: Platform) => void
  const component = mount(PlatformHarness, {
    target: document.body,
    props: {
      initial,
      ...options,
      onHotkey,
      onRecord,
      ready: (r, set) => {
        recorder = r
        setPlatform = set
      },
    },
  })
  flushSync()
  return { component, onHotkey, onRecord, recorder, setPlatform }
}

afterEach(() => {
  document.body.innerHTML = ''
  HotkeyManager.resetInstance()
})

describe('provider platform', () => {
  it('formats labels and updates when the platform changes', async () => {
    const { component, setPlatform } = setup('mac')
    expect(document.body.textContent).toBe('⌘ S')
    setPlatform('windows')
    flushSync()
    expect(document.body.textContent).toBe('Ctrl+S')
    await unmount(component)
  })

  it('lets an explicit platform option win', async () => {
    const { component } = setup('mac', { labelPlatform: 'windows' })
    expect(document.body.textContent).toBe('Ctrl+S')
    await unmount(component)
  })

  it.each([
    ['mac', { metaKey: true }, { ctrlKey: true }],
    ['windows', { ctrlKey: true }, { metaKey: true }],
  ] as const)('matches Mod on %s', async (platform, mod, other) => {
    const { component, onHotkey } = setup(platform)
    press(other)
    expect(onHotkey).not.toHaveBeenCalled()
    press(mod)
    expect(onHotkey).toHaveBeenCalledTimes(1)
    await unmount(component)
  })

  it('lets a per-hotkey platform win', async () => {
    const { component, onHotkey } = setup('mac', { hotkeyPlatform: 'windows' })
    press({ metaKey: true })
    expect(onHotkey).not.toHaveBeenCalled()
    press({ ctrlKey: true })
    expect(onHotkey).toHaveBeenCalledTimes(1)
    await unmount(component)
  })

  it.each([
    ['mac', { metaKey: true }],
    ['windows', { ctrlKey: true }],
  ] as const)('records Mod on %s', async (platform, mod) => {
    const { component, onRecord, recorder } = setup(platform)
    recorder.startRecording()
    press(mod)
    expect(onRecord).toHaveBeenCalledExactlyOnceWith('Mod+S')
    await unmount(component)
  })
})
