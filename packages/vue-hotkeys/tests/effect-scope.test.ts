import { effectScope, nextTick } from 'vue'
import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useHeldKeys } from '../src/useHeldKeys'
import { useHotkey } from '../src/useHotkey'
import { useHotkeyHint } from '../src/useHotkeyHint'
import { useHotkeyRecorder } from '../src/useHotkeyRecorder'
import { useHotkeys } from '../src/useHotkeys'

function press(key: string) {
  const code = `Key${key.toUpperCase()}`
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, code, bubbles: true }),
  )
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key, code, bubbles: true }),
  )
}

describe('composables in an effect scope outside a component', () => {
  let warn: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    HotkeyManager.resetInstance()
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warn.mockRestore()
    HotkeyManager.resetInstance()
  })

  it('register, fire, and clean up when the scope stops, with no warnings', async () => {
    const k = vi.fn()
    const j = vi.fn()
    const scope = effectScope()
    scope.run(() => {
      useHotkey('K', k)
      useHotkeys([{ hotkey: 'J', callback: j }])
      useHeldKeys()
      useHotkeyHint('Mod+K')
      useHotkeyRecorder({ onRecord: () => {} })
    })
    await nextTick()

    expect(getHotkeyManager().registrations.state.size).toBe(2)
    press('k')
    press('j')
    expect(k).toHaveBeenCalledTimes(1)
    expect(j).toHaveBeenCalledTimes(1)

    scope.stop()
    expect(getHotkeyManager().registrations.state.size).toBe(0)
    press('k')
    expect(k).toHaveBeenCalledTimes(1)
    expect(warn).not.toHaveBeenCalled()
  })
})
