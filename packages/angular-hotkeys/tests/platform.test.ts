import { Component, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { HotkeyManager } from '@tanstack/hotkeys'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { provideHotkeys } from '../src/hotkeys-provider'
import { injectFormatForDisplay } from '../src/injectFormatForDisplay'
import { injectHotkey } from '../src/injectHotkey'
import { injectHotkeyRecorder } from '../src/injectHotkeyRecorder'
import type { HotkeysProviderOptions } from '../src/hotkeys-provider'

function setup(defaultOptions: HotkeysProviderOptions) {
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideHotkeys({ defaultOptions }),
    ],
  })
}

function press(modifier: 'metaKey' | 'ctrlKey') {
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 's',
      code: 'KeyS',
      [modifier]: true,
      bubbles: true,
    }),
  )
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key: 's', code: 'KeyS', bubbles: true }),
  )
}

class Label {
  format = injectFormatForDisplay()
}
Component({
  selector: 'app-label',
  template: `<kbd>{{ format('Mod+S') }}</kbd><kbd>{{ format('Mod+S', { platform: 'windows' }) }}</kbd>`,
})(Label)

afterEach(() => {
  TestBed.resetTestingModule()
  HotkeyManager.resetInstance()
})

describe('provider platform', () => {
  it.each([
    ['mac', '⌘ S'],
    ['windows', 'Ctrl+S'],
  ] as const)(
    'formats labels for %s in a template',
    async (platform, label) => {
      setup({ platform })
      const fixture = TestBed.createComponent(Label)
      await fixture.whenStable()
      const labels = [...fixture.nativeElement.querySelectorAll('kbd')]
      expect(labels.map((kbd) => kbd.textContent)).toEqual([label, 'Ctrl+S'])
    },
  )

  it.each([
    ['mac', 'metaKey'],
    ['windows', 'ctrlKey'],
  ] as const)('matches Mod for %s', (platform, modifier) => {
    setup({ platform })
    const save = vi.fn()
    TestBed.runInInjectionContext(() => injectHotkey('Mod+S', save))
    TestBed.tick()
    press(modifier === 'metaKey' ? 'ctrlKey' : 'metaKey')
    expect(save).not.toHaveBeenCalled()
    press(modifier)
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('lets hotkey.platform and a per-hotkey platform win', () => {
    setup({ platform: 'mac', hotkey: { platform: 'windows' } })
    const fromDefaults = vi.fn()
    const fromCall = vi.fn()
    TestBed.runInInjectionContext(() => {
      injectHotkey('Mod+S', fromDefaults)
      injectHotkey('Mod+S', fromCall, {
        platform: 'mac',
        conflictBehavior: 'allow',
      })
    })
    TestBed.tick()
    press('ctrlKey')
    expect(fromDefaults).toHaveBeenCalledTimes(1)
    expect(fromCall).not.toHaveBeenCalled()
    press('metaKey')
    expect(fromCall).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['mac', 'Mod+[KeyS]'],
    ['windows', 'Meta+[KeyS]'],
  ] as const)('gives recorders the platform: %s', (platform, recorded) => {
    setup({ platform })
    const onRecord = vi.fn()
    const recorder = TestBed.runInInjectionContext(() =>
      injectHotkeyRecorder({ onRecord }),
    )
    TestBed.tick()
    recorder.startRecording()
    press('metaKey')
    expect(onRecord).toHaveBeenCalledWith(recorded)
  })
})
