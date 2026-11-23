import {
  ChangeDetectionStrategy,
  Component,
  ErrorHandler,
  Injectable,
  inject,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { HotkeyManager } from '@tanstack/hotkeys'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { provideHotkeys } from '../src/hotkeys-provider'
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

/**
 * Types each key a microtask apart: sooner than Angular's scheduled change
 * detection, which waits for a timeout or the next frame.
 */
async function typeEach(keys: Array<string>) {
  for (const key of keys) {
    type(key)
    await Promise.resolve()
  }
}

const log: Array<string> = []

// The inner scope moves down rows until the last one, then the outer scope
// takes the key.
class Rows {
  row = signal(0)
  constructor() {
    injectHotkey(
      'ArrowDown',
      () => {
        log.push(`move from ${this.row()}`)
        this.row.update((row) => row + 1)
      },
      () => ({ enabled: this.row() < 2 }),
    )
  }
}
Component({
  selector: 'app-rows',
  template: '{{ row() }}',
  providers: [provideHotkeys({ scope: 'rows' })],
})(Rows)

class Grid {
  constructor() {
    injectHotkey('ArrowDown', () => log.push('cross'))
  }
}
Component({
  selector: 'app-grid',
  imports: [Rows],
  template: '<app-rows />',
  providers: [provideHotkeys({ scope: 'grid' })],
})(Grid)

// The provider's own `enabled` turns the scope off after one key.
class Gate {
  open = signal(true)
}
Injectable({ providedIn: 'root' })(Gate)

class Once {
  constructor() {
    const gate = inject(Gate)
    injectHotkey('K', () => {
      log.push('once')
      gate.open.set(false)
    })
  }
}
Component({
  selector: 'app-once',
  template: '',
  providers: [
    provideHotkeys({ scope: 'once', enabled: () => inject(Gate).open() }),
  ],
})(Once)

// Two hotkeys on the same key.
class Pair {
  count = signal(0)
  checks = 0
  constructor() {
    injectHotkey('K', () => this.count.update((n) => n + 1))
    injectHotkey('K', () => this.count.update((n) => n + 1))
  }
  ngDoCheck() {
    this.checks++
  }
}
Component({ selector: 'app-pair', template: '{{ count() }}' })(Pair)

// An async callback turns its hotkey off once the save finishes.
class AsyncOnce {
  enabled = signal(true)
  calls = 0
  saved = Promise.withResolvers<void>()
  constructor() {
    injectHotkey(
      'K',
      async () => {
        this.calls++
        await this.saved.promise
        this.enabled.set(false)
      },
      () => ({ enabled: this.enabled() }),
    )
  }
}
Component({ selector: 'app-async-once', template: '' })(AsyncOnce)

// Its template throws once a hotkey sets `broken`.
class BrokenView {
  broken = signal(false)
  otherCalls = 0
  constructor() {
    injectHotkey('K', () => this.broken.set(true))
    injectHotkey('K', () => this.otherCalls++)
  }
  get label() {
    if (this.broken()) throw new Error('broken view')
    return ''
  }
}
Component({ selector: 'app-broken-view', template: '{{ label }}' })(BrokenView)

// An error handler that depends on a service with hotkeys.
class Toasts {
  constructor() {
    injectHotkey('Escape', () => {})
  }
}
Injectable({ providedIn: 'root' })(Toasts)

class ToastErrorHandler {
  toasts = inject(Toasts)
  handleError() {}
}

describe('change detection in zoneless apps', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    })
  })

  afterEach(() => {
    TestBed.resetTestingModule()
    HotkeyManager.resetInstance()
    log.length = 0
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

  it("applies a hotkey's enabled change before the next key", async () => {
    const fixture = TestBed.createComponent(Grid)
    await fixture.whenStable()
    await typeEach(['ArrowDown', 'ArrowDown', 'ArrowDown', 'ArrowDown'])
    expect(log).toEqual(['move from 0', 'move from 1', 'cross', 'cross'])
  })

  it("applies a provider's enabled change before the next key", async () => {
    const fixture = TestBed.createComponent(Once)
    await fixture.whenStable()
    await typeEach(['k', 'k'])
    expect(log).toEqual(['once'])
  })

  it("applies an async callback's enabled change before the next key", async () => {
    const fixture = TestBed.createComponent(AsyncOnce)
    await fixture.whenStable()
    const component = fixture.componentInstance
    await typeEach(['k'])
    component.saved.resolve()
    // Lets the callback finish, still sooner than scheduled change detection.
    for (let i = 0; i < 5; i++) await Promise.resolve()
    await typeEach(['k', 'k'])
    expect(component.calls).toBe(1)
  })

  it('renders once for all the callbacks of a key', async () => {
    const fixture = TestBed.createComponent(Pair)
    await fixture.whenStable()
    const before = fixture.componentInstance.checks
    type('k')
    await fixture.whenStable()
    expect(fixture.nativeElement.textContent).toBe('2')
    expect(fixture.componentInstance.checks - before).toBe(1)
  })

  it('reports a view error to the ErrorHandler and runs the other hotkeys', async () => {
    const handleError = vi.fn()
    TestBed.overrideProvider(ErrorHandler, { useValue: { handleError } })
    const fixture = TestBed.createComponent(BrokenView)
    await fixture.whenStable()
    await typeEach(['k'])
    expect(handleError).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'broken view' }),
    )
    expect(fixture.componentInstance.otherCalls).toBe(1)
  })

  it('works with an ErrorHandler that injects a service with hotkeys', () => {
    TestBed.overrideProvider(ErrorHandler, { useClass: ToastErrorHandler })
    expect(() => TestBed.inject(ErrorHandler)).not.toThrow()
  })
})
