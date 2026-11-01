import { createSignal } from 'solid-js'
import { render } from '@solidjs/testing-library'
import { HotkeyManager } from '@tanstack/hotkeys'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { createFormatForDisplay } from '../src/createFormatForDisplay'
import { createHotkey } from '../src/createHotkey'
import { createHotkeyRecorder } from '../src/createHotkeyRecorder'
import type { JSX } from 'solid-js'

type Platform = 'mac' | 'windows' | 'linux'

function press(init: KeyboardEventInit) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 's', bubbles: true, ...init }),
  )
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key: 's', bubbles: true, ...init }),
  )
}

function renderIn(platform: Platform, child: () => JSX.Element) {
  return render(() => (
    <HotkeysProvider defaultOptions={{ platform }}>{child()}</HotkeysProvider>
  ))
}

afterEach(() => {
  HotkeyManager.resetInstance()
})

describe('provider platform', () => {
  it('formats labels and updates when the platform changes', () => {
    const [platform, setPlatform] = createSignal<Platform>('mac')
    function Label() {
      const format = createFormatForDisplay()
      return <kbd>{format('Mod+S')}</kbd>
    }
    const { container, unmount } = render(() => (
      <HotkeysProvider defaultOptions={{ platform: platform() }}>
        <Label />
      </HotkeysProvider>
    ))
    expect(container.textContent).toBe('⌘ S')
    setPlatform('windows')
    expect(container.textContent).toBe('Ctrl+S')
    unmount()
  })

  it('lets an explicit platform option win', () => {
    function Label() {
      const format = createFormatForDisplay()
      return <kbd>{format('Mod+S', { platform: 'windows' })}</kbd>
    }
    const { container, unmount } = renderIn('mac', () => <Label />)
    expect(container.textContent).toBe('Ctrl+S')
    unmount()
  })

  it.each([
    ['mac', { metaKey: true }, { ctrlKey: true }],
    ['windows', { ctrlKey: true }, { metaKey: true }],
  ] as const)('matches Mod on %s', (platform, mod, other) => {
    const callback = vi.fn()
    function Shortcut() {
      createHotkey('Mod+S', callback)
      return null
    }
    const { unmount } = renderIn(platform, () => <Shortcut />)
    press(other)
    expect(callback).not.toHaveBeenCalled()
    press(mod)
    expect(callback).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('lets a per-hotkey platform win', () => {
    const callback = vi.fn()
    function Shortcut() {
      createHotkey('Mod+S', callback, { platform: 'windows' })
      return null
    }
    const { unmount } = renderIn('mac', () => <Shortcut />)
    press({ metaKey: true })
    expect(callback).not.toHaveBeenCalled()
    press({ ctrlKey: true })
    expect(callback).toHaveBeenCalledTimes(1)
    unmount()
  })

  it.each([
    ['mac', { metaKey: true }],
    ['windows', { ctrlKey: true }],
  ] as const)('records Mod on %s', (platform, mod) => {
    const onRecord = vi.fn()
    let recorder!: ReturnType<typeof createHotkeyRecorder>
    function Recorder() {
      recorder = createHotkeyRecorder({ onRecord, recordBy: 'key' })
      return null
    }
    const { unmount } = renderIn(platform, () => <Recorder />)
    recorder.startRecording()
    press(mod)
    expect(onRecord).toHaveBeenCalledExactlyOnceWith('Mod+S')
    unmount()
  })
})
