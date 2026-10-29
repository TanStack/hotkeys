import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSharedHotkeys } from './effect-root-harness.svelte'

function press(key: string) {
  const code = `Key${key.toUpperCase()}`
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, code, bubbles: true }),
  )
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key, code, bubbles: true }),
  )
}

describe('hotkey functions in $effect.root', () => {
  beforeEach(() => HotkeyManager.resetInstance())
  afterEach(() => HotkeyManager.resetInstance())

  it('register, fire, and clean up when the root is destroyed', () => {
    const k = vi.fn()
    const j = vi.fn()
    const { destroy, recorder } = createSharedHotkeys(k, j)

    expect(getHotkeyManager().registrations.state.size).toBe(2)
    press('k')
    press('j')
    expect(k).toHaveBeenCalledTimes(1)
    expect(j).toHaveBeenCalledTimes(1)

    recorder.startRecording()
    expect(recorder.isRecording).toBe(true)

    destroy()
    expect(getHotkeyManager().registrations.state.size).toBe(0)
    expect(recorder.isRecording).toBe(false)
    press('k')
    expect(k).toHaveBeenCalledTimes(1)
  })
})
