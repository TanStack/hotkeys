// Load zone.js before Angular creates an NgZone.
import 'zone.js'
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  NgZone,
  provideZoneChangeDetection,
} from '@angular/core'
import { ComponentFixtureAutoDetect, TestBed } from '@angular/core/testing'
import {
  HotkeyManager,
  KeyStateTracker,
  getKeyboardLayoutStore,
} from '@tanstack/hotkeys'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { injectFormatForDisplay } from '../src/injectFormatForDisplay'
import { injectHeldKeys } from '../src/injectHeldKeys'
import { injectHotkey } from '../src/injectHotkey'
import { injectHotkeyRecorder } from '../src/injectHotkeyRecorder'
import { injectKeyboardLayout } from '../src/injectKeyboardLayout'

const inZone: Array<boolean> = []

function type(key: string, code?: string) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, code, bubbles: true }),
  )
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key, code, bubbles: true }),
  )
}

/** Counts zone turns, each of which runs change detection. */
async function setup() {
  TestBed.configureTestingModule({
    providers: [provideZoneChangeDetection()],
  })
  const zone = TestBed.inject(NgZone)
  // Inject and run effects inside the zone, as a component would.
  const recorder = zone.run(() => {
    const result = TestBed.runInInjectionContext(() => {
      injectHotkey('K', () => inZone.push(NgZone.isInAngularZone()))
      injectHeldKeys()
      return injectHotkeyRecorder({
        onRecord: () => inZone.push(NgZone.isInAngularZone()),
      })
    })
    TestBed.tick()
    return result
  })
  await TestBed.inject(ApplicationRef).whenStable()
  const counter = { turns: 0 }
  zone.onMicrotaskEmpty.subscribe(() => counter.turns++)
  return { zone, recorder, counter }
}

afterEach(() => {
  TestBed.resetTestingModule()
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
  getKeyboardLayoutStore().setState(() => null)
  vi.unstubAllGlobals()
  inZone.length = 0
})

describe('zone.js apps', () => {
  it('runs no change detection for keys that match no hotkey', async () => {
    const { counter } = await setup()
    for (const key of 'abcdefghij') type(key)
    expect(counter.turns).toBe(0)
  })

  it('runs a matching callback inside the Angular zone', async () => {
    const { counter } = await setup()
    type('k')
    expect(inZone).toEqual([true])
    expect(counter.turns).toBeGreaterThan(0)
  })

  it('attaches the key state tracker outside the zone', async () => {
    // happy-dom's window listeners escape zone.js, so check where they attach.
    const attached: Array<boolean> = []
    const spy = vi
      .spyOn(window, 'addEventListener')
      .mockImplementation((type) => {
        if (type === 'mousemove') attached.push(NgZone.isInAngularZone())
      })
    await setup()
    spy.mockRestore()
    expect(attached).toEqual([false])
  })

  it('attaches the keyboard layout loader outside the zone', async () => {
    const attached: Array<boolean> = []
    const spy = vi
      .spyOn(window, 'addEventListener')
      .mockImplementation((type) => {
        if (type === 'focus') attached.push(NgZone.isInAngularZone())
      })
    TestBed.configureTestingModule({
      providers: [provideZoneChangeDetection()],
    })
    TestBed.inject(NgZone).run(() => {
      TestBed.runInInjectionContext(() => injectKeyboardLayout())
      // The first tick runs the render hook, and the second runs the effect.
      TestBed.tick()
      TestBed.tick()
    })
    await TestBed.inject(ApplicationRef).whenStable()
    spy.mockRestore()
    expect(attached).toEqual([false])
  })

  it('records outside the zone and calls onRecord inside it', async () => {
    const { zone, recorder, counter } = await setup()
    zone.run(() => recorder.startRecording())
    await TestBed.inject(ApplicationRef).whenStable()
    counter.turns = 0
    type('Shift', 'ShiftLeft')
    expect(counter.turns).toBe(0)
    type('j', 'KeyJ')
    expect(recorder.recordedHotkey()).not.toBeNull()
    expect(inZone).toEqual([true])
  })
})

describe('zone.js views', () => {
  function counter(changeDetection: ChangeDetectionStrategy) {
    class Counter {
      count = 0
      recorded = ''
      recorder = injectHotkeyRecorder({
        onRecord: (hotkey) => (this.recorded = hotkey),
      })
      constructor() {
        injectHotkey('K', () => this.count++)
      }
    }
    Component({
      selector: 'app-counter',
      template: '{{ count }} {{ recorded }}',
      changeDetection,
    })(Counter)
    TestBed.configureTestingModule({
      providers: [
        provideZoneChangeDetection(),
        { provide: ComponentFixtureAutoDetect, useValue: true },
      ],
    })
    return TestBed.createComponent(Counter)
  }

  for (const [name, strategy] of [
    ['Eager', ChangeDetectionStrategy.Eager],
    ['OnPush', ChangeDetectionStrategy.OnPush],
  ] as const) {
    it(`updates a ${name} view when the keyboard layout loads`, async () => {
      const getLayoutMap = () => Promise.resolve(new Map([['KeyQ', 'a']]))
      vi.stubGlobal('navigator', { ...navigator, keyboard: { getLayoutMap } })
      class Label {
        format = injectFormatForDisplay()
      }
      Component({
        selector: 'app-label',
        template: `{{ format('[KeyQ]') }}`,
        changeDetection: strategy,
      })(Label)
      TestBed.configureTestingModule({
        providers: [
          provideZoneChangeDetection(),
          { provide: ComponentFixtureAutoDetect, useValue: true },
        ],
      })
      const fixture = TestBed.createComponent(Label)
      expect(fixture.nativeElement.textContent).toBe('Q')
      await fixture.whenStable()
      // Lets the layout request resolve
      await new Promise((resolve) => setTimeout(resolve))
      await fixture.whenStable()
      expect(fixture.nativeElement.textContent).toBe('A')
    })

    it(`updates a ${name} view when a callback changes a field`, async () => {
      const fixture = counter(strategy)
      await fixture.whenStable()
      expect(fixture.nativeElement.textContent.trim()).toBe('0')
      type('k', 'KeyK')
      await fixture.whenStable()
      expect(fixture.nativeElement.textContent.trim()).toBe('1')
    })

    it(`updates a ${name} view when onRecord changes a field`, async () => {
      const fixture = counter(strategy)
      await fixture.whenStable()
      fixture.componentInstance.recorder.startRecording()
      type('j', 'KeyJ')
      await fixture.whenStable()
      expect(fixture.nativeElement.textContent.trim()).toBe('0 J')
    })
  }
})
