import {
  ChangeDetectionStrategy,
  Component,
  Injectable,
  inject,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { HotkeyManager } from '@tanstack/hotkeys'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { injectHotkey } from '../src/injectHotkey'
import { injectHotkeyRecorder } from '../src/injectHotkeyRecorder'
import { injectHotkeys } from '../src/injectHotkeys'

function type(key: string, code?: string) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, code, bubbles: true }),
  )
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key, code, bubbles: true }),
  )
}

const strategies = [
  ['Eager', ChangeDetectionStrategy.Eager],
  ['OnPush', ChangeDetectionStrategy.OnPush],
] as const

function fieldCounter(changeDetection: ChangeDetectionStrategy) {
  class FieldCounter {
    count = 0
    constructor() {
      injectHotkey('K', () => this.count++)
    }
  }
  Component({
    selector: 'app-counter',
    template: '{{ count }}',
    changeDetection,
  })(FieldCounter)
  return FieldCounter
}

function signalCounter(changeDetection: ChangeDetectionStrategy) {
  class SignalCounter {
    count = signal(0)
    constructor() {
      injectHotkey('K', () => this.count.update((n) => n + 1))
    }
  }
  Component({
    selector: 'app-counter',
    template: '{{ count() }}',
    changeDetection,
  })(SignalCounter)
  return SignalCounter
}

class AsyncFieldCounter {
  count = 0
  constructor() {
    injectHotkey('K', async () => {
      await new Promise((resolve) => setTimeout(resolve, 20))
      this.count++
    })
  }
}
Component({
  selector: 'app-async-counter',
  template: '{{ count }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})(AsyncFieldCounter)

class Recorder {
  recorded = ''
  recorder = injectHotkeyRecorder({
    onRecord: (hotkey) => (this.recorded = hotkey),
  })
}
Component({
  selector: 'app-recorder',
  template: '{{ recorded }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})(Recorder)

class DoCheckCounter {
  checks = 0
  constructor() {
    injectHotkey('K', () => {})
  }
  ngDoCheck() {
    this.checks++
  }
}
Component({ selector: 'app-do-check', template: '' })(DoCheckCounter)

class Shortcuts {
  calls = 0
  count = signal(0)
  constructor() {
    injectHotkeys([
      {
        hotkey: 'K',
        callback: () => {
          this.calls++
          this.count.update((n) => n + 1)
        },
      },
    ])
  }
}
Injectable({ providedIn: 'root' })(Shortcuts)

class ShortcutsView {
  shortcuts = inject(Shortcuts)
}
Component({
  selector: 'app-shortcuts-view',
  template: '{{ shortcuts.count() }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})(ShortcutsView)

describe('change detection in zoneless apps', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    })
  })

  afterEach(() => {
    TestBed.resetTestingModule()
    HotkeyManager.resetInstance()
  })

  for (const [name, strategy] of strategies) {
    for (const [kind, make] of [
      ['field', fieldCounter],
      ['signal', signalCounter],
    ] as const) {
      it(`updates a ${name} view when a callback changes a ${kind}`, async () => {
        const fixture = TestBed.createComponent(make(strategy))
        await fixture.whenStable()
        expect(fixture.nativeElement.textContent).toBe('0')
        type('k', 'KeyK')
        await fixture.whenStable()
        expect(fixture.nativeElement.textContent).toBe('1')
      })
    }
  }

  it('updates an OnPush view when an async callback changes a field after await', async () => {
    const fixture = TestBed.createComponent(AsyncFieldCounter)
    await fixture.whenStable()
    type('k', 'KeyK')
    await fixture.whenStable()
    await new Promise((resolve) => setTimeout(resolve, 40))
    await fixture.whenStable()
    expect(fixture.nativeElement.textContent).toBe('1')
  })

  it('updates an OnPush view when onRecord changes a field', async () => {
    const fixture = TestBed.createComponent(Recorder)
    await fixture.whenStable()
    fixture.componentInstance.recorder.startRecording()
    type('j', 'KeyJ')
    await fixture.whenStable()
    expect(fixture.nativeElement.textContent).toBe('J')
  })

  it('runs no change detection for keys that match no hotkey', async () => {
    const fixture = TestBed.createComponent(DoCheckCounter)
    await fixture.whenStable()
    const before = fixture.componentInstance.checks
    for (const key of 'abcdefghij') type(key, `Key${key.toUpperCase()}`)
    await fixture.whenStable()
    expect(fixture.componentInstance.checks).toBe(before)
    type('k', 'KeyK')
    await fixture.whenStable()
    expect(fixture.componentInstance.checks).toBeGreaterThan(before)
  })

  it('runs callbacks for hotkeys registered in a root service', async () => {
    const shortcuts = TestBed.inject(Shortcuts)
    TestBed.tick()
    type('k', 'KeyK')
    expect(shortcuts.calls).toBe(1)
  })

  it('updates an OnPush view that reads a root-service signal', async () => {
    const fixture = TestBed.createComponent(ShortcutsView)
    await fixture.whenStable()
    expect(fixture.nativeElement.textContent).toBe('0')
    type('k', 'KeyK')
    await fixture.whenStable()
    expect(fixture.nativeElement.textContent).toBe('1')
  })
})
