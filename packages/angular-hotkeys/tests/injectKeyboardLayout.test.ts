import {
  Component,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { HotkeyManager, getKeyboardLayoutStore } from '@tanstack/hotkeys'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { provideHotkeys } from '../src/hotkeys-provider'
import { injectFormatForDisplay } from '../src/injectFormatForDisplay'
import { injectKeyboardLayout } from '../src/injectKeyboardLayout'
import type { Type } from '@angular/core'
import type { ComponentFixture } from '@angular/core/testing'

const AZERTY = new Map([['KeyQ', 'a']])
// The French BÉPO layout types `b` on this key
const BEPO = new Map([['KeyQ', 'b']])

class Label {
  format = injectFormatForDisplay()
}
Component({
  selector: 'app-label',
  template: `<kbd>{{ format('Mod+[KeyQ]') }}</kbd>`,
})(Label)

/** Stubs `navigator.keyboard.getLayoutMap` and returns the mock. */
function stubLayout(result: () => Promise<Map<string, string>>) {
  const getLayoutMap = vi.fn(result)
  vi.stubGlobal('navigator', { ...navigator, keyboard: { getLayoutMap } })
  return getLayoutMap
}

/** Configures an app whose provider has these defaults. */
function setup(keyboardLayout?: boolean | (() => boolean)) {
  TestBed.configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideHotkeys({
        defaultOptions: () => ({
          platform: 'windows',
          keyboardLayout:
            typeof keyboardLayout === 'function'
              ? keyboardLayout()
              : keyboardLayout,
        }),
      }),
    ],
  })
}

/** Lets the layout request resolve, then applies the update. */
async function settle(fixture: ComponentFixture<unknown>) {
  await Promise.resolve()
  await Promise.resolve()
  await fixture.whenStable()
}

/** Renders a component and waits for the layout. */
async function render<T>(component: Type<T>): Promise<ComponentFixture<T>> {
  const fixture = TestBed.createComponent(component)
  await fixture.whenStable()
  await settle(fixture)
  return fixture
}

const text = (fixture: ComponentFixture<unknown>): string =>
  fixture.nativeElement.textContent

afterEach(() => {
  TestBed.resetTestingModule()
  // The layout outlives the components that loaded it
  getKeyboardLayoutStore().setState(() => null)
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  HotkeyManager.resetInstance()
})

describe('keyboard layout labels', () => {
  it('labels a physical key with what it types once the layout loads', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    setup()
    const fixture = TestBed.createComponent(Label)
    fixture.detectChanges()
    expect(text(fixture)).toBe('Ctrl+Q')
    await settle(fixture)
    expect(text(fixture)).toBe('Ctrl+A')
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('loads the layout without a provider', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    })
    class Bare {
      format = injectFormatForDisplay()
    }
    Component({
      selector: 'app-bare',
      template: `<kbd>{{ format('[KeyQ]') }}</kbd>`,
    })(Bare)
    const fixture = await render(Bare)
    expect(text(fixture)).toBe('A')
  })

  it('reads the layout once for many labels', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    setup()
    class Labels {}
    Component({
      selector: 'app-labels',
      imports: [Label],
      template: `<app-label /><app-label /><app-label />`,
    })(Labels)
    const fixture = await render(Labels)
    expect(text(fixture)).toBe('Ctrl+ACtrl+ACtrl+A')
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('never asks the browser when keyboardLayout is false', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    // Another part of the page may have loaded the layout already
    getKeyboardLayoutStore().setState(() => AZERTY)
    setup(false)
    class Reader {
      format = injectFormatForDisplay()
      layoutMap = injectKeyboardLayout()
    }
    Component({
      selector: 'app-reader',
      template: `<kbd>{{ format('Mod+[KeyQ]') }}</kbd><i>{{ layoutMap() === null }}</i>`,
    })(Reader)
    const fixture = await render(Reader)
    expect(getLayoutMap).not.toHaveBeenCalled()
    expect(fixture.nativeElement.querySelector('kbd').textContent).toBe(
      'Ctrl+Q',
    )
    expect(fixture.nativeElement.querySelector('i').textContent).toBe('true')
  })

  it('lets a nested provider turn the layout back on', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    setup(false)
    class Section {}
    Component({
      selector: 'app-section',
      imports: [Label],
      providers: [provideHotkeys({ defaultOptions: { keyboardLayout: true } })],
      template: `<app-label />`,
    })(Section)
    const fixture = await render(Section)
    expect(text(fixture)).toBe('Ctrl+A')
  })

  it('follows the provider when keyboardLayout changes', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const keyboardLayout = signal(false)
    setup(keyboardLayout)
    const fixture = await render(Label)
    expect(getLayoutMap).not.toHaveBeenCalled()

    keyboardLayout.set(true)
    await fixture.whenStable()
    await settle(fixture)
    expect(text(fixture)).toBe('Ctrl+A')

    keyboardLayout.set(false)
    await fixture.whenStable()
    expect(text(fixture)).toBe('Ctrl+Q')
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('renders the conventional label first, even when the layout has loaded', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    getKeyboardLayoutStore().setState(() => AZERTY)
    setup()
    // A component that hydrates must first render what the server rendered
    const seen: Array<string> = []
    class Recorded {
      format = injectFormatForDisplay()
      label() {
        const label = this.format('Mod+[KeyQ]')
        if (seen.at(-1) !== label) seen.push(label)
        return label
      }
    }
    Component({
      selector: 'app-recorded',
      template: `<kbd>{{ label() }}</kbd>`,
    })(Recorded)
    const fixture = await render(Recorded)
    expect(seen).toEqual(['Ctrl+Q', 'Ctrl+A'])
    expect(text(fixture)).toBe('Ctrl+A')
  })

  it('shows the loaded layout to a label that mounts later', async () => {
    // The browser never answers the second label's request
    let answer: Promise<Map<string, string>> = Promise.resolve(AZERTY)
    stubLayout(() => answer)
    setup()
    const first = await render(Label)
    first.destroy()
    answer = new Promise(() => {})
    // Such as a tooltip that opens again. The label has the layout as soon
    // as it has rendered, without waiting for the browser.
    const second = TestBed.createComponent(Label)
    TestBed.tick()
    expect(text(second)).toBe('Ctrl+A')
  })

  it('follows a layout change when the window regains focus', async () => {
    let layout = AZERTY
    stubLayout(() => Promise.resolve(layout))
    setup()
    const fixture = await render(Label)
    expect(text(fixture)).toBe('Ctrl+A')
    layout = BEPO
    window.dispatchEvent(new Event('focus'))
    await settle(fixture)
    expect(text(fixture)).toBe('Ctrl+B')
  })

  it('stops reading the layout on focus once no label is mounted', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    setup()
    const fixture = await render(Label)
    fixture.destroy()
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('keeps conventional labels where the browser reports no layout', async () => {
    vi.stubGlobal('navigator', { ...navigator, keyboard: undefined })
    setup()
    const fixture = await render(Label)
    expect(text(fixture)).toBe('Ctrl+Q')
  })

  it('lets a layoutMap passed to format win over the loaded layout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    setup()
    class Custom {
      format = injectFormatForDisplay()
      layoutMap = new Map([['KeyQ', 'x']])
    }
    Component({
      selector: 'app-custom',
      template: `<kbd>{{ format('[KeyQ]', { layoutMap }) }}</kbd>`,
    })(Custom)
    const fixture = await render(Custom)
    expect(text(fixture)).toBe('X')
  })

  it('returns the layout from injectKeyboardLayout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    setup()
    class Reader {
      layoutMap = injectKeyboardLayout()
    }
    Component({
      selector: 'app-reader',
      template: `<i>{{ layoutMap()?.get('KeyQ') ?? 'none' }}</i>`,
    })(Reader)
    const fixture = TestBed.createComponent(Reader)
    fixture.detectChanges()
    expect(text(fixture)).toBe('none')
    await settle(fixture)
    expect(text(fixture)).toBe('a')
  })

  it('loads the layout for a service, after the app renders', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    setup()
    const layoutMap = TestBed.runInInjectionContext(() =>
      injectKeyboardLayout(),
    )
    expect(layoutMap()).toBeNull()
    expect(getLayoutMap).not.toHaveBeenCalled()
    await render(Label)
    expect(layoutMap()?.get('KeyQ')).toBe('a')
  })
})
