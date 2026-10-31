import {
  Component,
  ElementRef,
  ViewChild,
  provideZonelessChangeDetection,
  signal,
  viewChild,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { HotkeyManager } from '@tanstack/hotkeys'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { injectHotkey } from '../src/injectHotkey'

function press(target: EventTarget) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'k', bubbles: true }),
  )
  target.dispatchEvent(new KeyboardEvent('keyup', { key: 'k', bubbles: true }))
}

const onK = vi.fn()

class Panel {
  panel = viewChild<ElementRef<HTMLElement>>('panel')
  constructor() {
    injectHotkey('K', onK, { target: this.panel })
  }
}
// Plain JIT needs the metadata the Angular CLI emits for signal queries.
ViewChild('panel', { isSignal: true } as never)(Panel.prototype, 'panel')
Component({ selector: 'app-panel', template: '<div #panel></div>' })(Panel)

class RequiredPanel {
  panel = viewChild.required<ElementRef<HTMLElement>>('panel')
  constructor() {
    injectHotkey('K', onK, () => ({ target: this.panel() }))
  }
}
ViewChild('panel', { isSignal: true } as never)(
  RequiredPanel.prototype,
  'panel',
)
Component({ selector: 'app-required', template: '<div #panel></div>' })(
  RequiredPanel,
)

describe('injectHotkey targets', () => {
  beforeEach(() => {
    HotkeyManager.resetInstance()
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    })
  })

  afterEach(() => {
    TestBed.resetTestingModule()
    HotkeyManager.resetInstance()
    onK.mockClear()
  })

  it('accepts an ElementRef', () => {
    const element = document.body.appendChild(document.createElement('div'))
    TestBed.runInInjectionContext(() => {
      injectHotkey('K', onK, { target: new ElementRef(element) })
    })
    TestBed.tick()
    press(element)
    expect(onK).toHaveBeenCalledTimes(1)
    element.remove()
  })

  it('tracks a signal target and skips it while undefined', () => {
    const element = document.body.appendChild(document.createElement('div'))
    const target = signal<ElementRef<HTMLElement> | undefined>(undefined)
    TestBed.runInInjectionContext(() => {
      injectHotkey('K', onK, { target })
    })
    TestBed.tick()
    press(element)
    expect(HotkeyManager.getInstance().registrations.state.size).toBe(0)

    target.set(new ElementRef(element))
    TestBed.tick()
    press(element)
    expect(onK).toHaveBeenCalledTimes(1)
    element.remove()
  })

  it.each([
    ['viewChild', Panel],
    ['viewChild.required', RequiredPanel],
  ])('accepts a %s target', async (_, component) => {
    const fixture = TestBed.createComponent(component as typeof Panel)
    await fixture.whenStable()
    const element = fixture.nativeElement.querySelector('div') as HTMLElement
    press(element)
    expect(onK).toHaveBeenCalledTimes(1)
    press(document)
    expect(onK).toHaveBeenCalledTimes(1)
  })
})
