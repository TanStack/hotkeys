import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  Input,
  ViewChild,
  computed,
  inject,
  input,
  provideZonelessChangeDetection,
  signal,
  viewChild,
} from '@angular/core'
import { TestBed } from '@angular/core/testing'
import {
  entryKeys,
  runConformanceSuite,
} from '@tanstack/hotkeys-test-utils/conformance'
import { vitestRunner } from '@tanstack/hotkeys-test-utils/conformance/vitest'
import { provideHotkeys } from '../src/hotkeys-provider'
import { injectFormatForDisplay } from '../src/injectFormatForDisplay'
import { injectHeldKeyCodes } from '../src/injectHeldKeyCodes'
import { injectHeldKeys } from '../src/injectHeldKeys'
import { injectHotkey } from '../src/injectHotkey'
import { injectHotkeyHint } from '../src/injectHotkeyHint'
import { injectHotkeyRecorder } from '../src/injectHotkeyRecorder'
import { injectHotkeyRegistrations } from '../src/injectHotkeyRegistrations'
import { injectHotkeys } from '../src/injectHotkeys'
import { injectKeyHold } from '../src/injectKeyHold'
import type { ElementRef, Provider, Signal, Type } from '@angular/core'
import type { ComponentFixture } from '@angular/core/testing'
import type {
  IndividualKey,
  RegisterableHotkey,
  formatForDisplay,
} from '@tanstack/hotkeys'
import type {
  ConformanceHarness,
  ConformanceHotkey,
  ConformanceProvider,
  HotkeysSpec,
} from '@tanstack/hotkeys-test-utils/conformance'
import type { AngularHotkeyRecorder } from '../src/injectHotkeyRecorder'
import type { InjectHotkeyDefinition } from '../src/injectHotkeys'

interface HotkeysHost {
  spec: Signal<HotkeysSpec>
  target: Signal<ElementRef<HTMLElement> | undefined>
}
const HOST = new InjectionToken<HotkeysHost>('conformance host')

/** Passes `target` only when the spec sets it, so other hotkeys use the document. */
function options(entry: ConformanceHotkey, host: HotkeysHost) {
  if (!entry.options || !('target' in entry.options)) return entry.options ?? {}
  return { ...entry.options, target: host.target() }
}

class HotkeyOne {
  readonly entry = input.required<ConformanceHotkey>()
  constructor() {
    const host = inject(HOST)
    // Keyed by callback, so an entry's callback never changes.
    injectHotkey(
      () => this.entry().hotkey as RegisterableHotkey,
      (event, context) => this.entry().callback(event, context),
      () => options(this.entry(), host),
    )
  }
}
Input({ isSignal: true, alias: 'entry', required: true } as never)(
  HotkeyOne.prototype,
  'entry',
)
Component({ selector: 'conformance-one', template: '' })(HotkeyOne)

class HotkeyList {
  constructor() {
    const host = inject(HOST)
    injectHotkeys(
      () =>
        host.spec().hotkeys.map((entry) => ({
          hotkey: entry.hotkey,
          callback: entry.callback,
          options: options(entry, host),
        })) as Array<InjectHotkeyDefinition>,
    )
  }
}
Component({ selector: 'conformance-list', template: '' })(HotkeyList)

/** `provideHotkeys` for a spec's provider, read through getters so it updates. */
function hotkeysProvider(
  initial: ConformanceProvider | undefined,
  provider: () => ConformanceProvider | undefined,
): Array<Provider> {
  if (!initial) return []
  return [
    provideHotkeys({
      appHotkeys: initial.appHotkeys,
      scope: () => provider()?.scope,
      enabled: () => provider()?.enabled,
      exclusive: () => provider()?.exclusive,
      customHotkeys: () => provider()?.customHotkeys as never,
      defaultOptions: () => ({
        platform: provider()?.platform,
        hotkey: provider()?.hotkey,
      }),
    }),
  ]
}

const fixtures: Array<ComponentFixture<unknown>> = []

/** Creates an OnPush component, renders it, and waits for it to settle. */
function create<T>(
  type: Type<T>,
  metadata: {
    template: string
    providers?: Array<Provider>
    imports?: Array<Type<unknown>>
  },
): ComponentFixture<T> {
  Component({
    selector: 'conformance-view',
    changeDetection: ChangeDetectionStrategy.OnPush,
    ...metadata,
  })(type)
  const fixture = TestBed.createComponent(type)
  fixtures.push(fixture as ComponentFixture<unknown>)
  // TestBed detaches earlier roots when it creates one; keep every view in
  // the document, as an app would, so focus works.
  for (const each of fixtures) {
    const root = each.nativeElement as HTMLElement
    if (!root.isConnected) document.body.append(root)
  }
  fixture.autoDetectChanges()
  TestBed.tick()
  return fixture
}

function text(fixture: ComponentFixture<unknown>, id: string) {
  const element = fixture.nativeElement as HTMLElement
  return element.querySelector(`[data-testid="${id}"]`)?.textContent ?? ''
}

function destroy(fixture: ComponentFixture<unknown>) {
  return () => {
    fixture.destroy()
    TestBed.tick()
  }
}

const tick = (change: () => unknown) => {
  change()
  TestBed.tick()
}

const harness: ConformanceHarness = {
  name: 'Angular',
  unsupported: {
    'callback-identity':
      'injectHotkey keeps its first callback; callbacks read signals instead',
    'late-app-hotkeys':
      'provideHotkeys reads appHotkeys once, when its injector is created',
  },
  act: tick,
  setup() {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    })
  },
  cleanup() {
    fixtures.length = 0
    TestBed.resetTestingModule()
  },

  mountHeldKeys(initial) {
    class HeldKeysView {
      readonly watch = signal<IndividualKey>(initial)
      readonly keys = injectHeldKeys()
      readonly codes = injectHeldKeyCodes()
      readonly held = injectKeyHold(() => this.watch())
      readonly keysText = computed(() => JSON.stringify(this.keys()))
      readonly codesText = computed(() => JSON.stringify(this.codes()))
    }
    const fixture = create(HeldKeysView, {
      template: `
        <output data-testid="keys">{{ keysText() }}</output>
        <output data-testid="codes">{{ codesText() }}</output>
        <output data-testid="held">{{ held() }}</output>
      `,
    })
    return {
      keys: () => JSON.parse(text(fixture, 'keys')),
      codes: () => JSON.parse(text(fixture, 'codes')),
      held: () => text(fixture, 'held') === 'true',
      setKey: (key) => tick(() => fixture.componentInstance.watch.set(key)),
      unmount: destroy(fixture),
    }
  },

  mountRegistrations() {
    class RegistrationsView {
      readonly registrations = injectHotkeyRegistrations()
    }
    const fixture = create(RegistrationsView, {
      template: `<output data-testid="count">{{ registrations().length }}</output>`,
    })
    return {
      list: () => fixture.componentInstance.registrations(),
      rendered: () => Number(text(fixture, 'count')),
      unmount: destroy(fixture),
    }
  },

  mountHotkeys(initial) {
    class HotkeysView implements HotkeysHost {
      readonly spec = signal(initial)
      readonly target = viewChild<ElementRef<HTMLElement>>('target')
      // One component per callback, so changing an entry updates it in place.
      readonly keys = computed(() => entryKeys(this.spec().hotkeys))
      entryFor(key: string) {
        return this.spec().hotkeys[this.keys().indexOf(key)]!
      }
    }
    ViewChild('target', { isSignal: true } as never)(
      HotkeysView.prototype,
      'target',
    )
    const fixture = create(HotkeysView, {
      imports: [HotkeyOne, HotkeyList],
      providers: [
        { provide: HOST, useExisting: HotkeysView },
        ...hotkeysProvider(
          initial.provider,
          () => inject(HotkeysView).spec().provider,
        ),
      ],
      template: `
        <div tabindex="0" #target></div>
        @if (spec().form === 'list') {
          <conformance-list />
        } @else {
          @for (key of keys(); track key) {
            <conformance-one [entry]="entryFor(key)" />
          }
        }
      `,
    })
    const view = fixture.componentInstance
    return {
      update: (next) =>
        tick(() => view.spec.update((spec) => ({ ...spec, ...next }))),
      element: () => view.target()!.nativeElement,
      unmount: destroy(fixture),
    }
  },

  mountRecorder({ options: recorderOptions, provider }) {
    class RecorderView {
      readonly recorder: AngularHotkeyRecorder = injectHotkeyRecorder(
        recorderOptions as never,
      )
    }
    const fixture = create(RecorderView, {
      template: '',
      providers: hotkeysProvider(provider, () => provider),
    })
    const recorder = fixture.componentInstance.recorder
    return {
      state: () => ({
        isRecording: recorder.isRecording(),
        steps: recorder.steps(),
        recordedHotkey: recorder.recordedHotkey(),
      }),
      start: () => tick(() => recorder.startRecording()),
      stop: () => tick(() => recorder.stopRecording()),
      cancel: () => tick(() => recorder.cancelRecording()),
      commit: () => tick(() => recorder.commitRecording()),
      unmount: destroy(fixture),
    }
  },

  mountHint(initial) {
    class HintView {
      readonly hotkey = signal(initial.hotkey)
      readonly hint = injectHotkeyHint(() => this.hotkey(), initial.options)
    }
    const fixture = create(HintView, {
      template: `<output data-testid="hint">{{ hint() }}</output>`,
    })
    return {
      value: () => text(fixture, 'hint') === 'true',
      setHotkey: (hotkey) =>
        tick(() => fixture.componentInstance.hotkey.set(hotkey)),
      unmount: destroy(fixture),
    }
  },

  mountFormat({ platform }) {
    class FormatView {
      readonly format: typeof formatForDisplay = injectFormatForDisplay()
    }
    const provider = platform ? { platform } : undefined
    const fixture = create(FormatView, {
      template: '',
      providers: hotkeysProvider(provider, () => provider),
    })
    return {
      format: (hotkey, formatOptions) =>
        fixture.componentInstance.format(hotkey, formatOptions),
      unmount: destroy(fixture),
    }
  },
}

runConformanceSuite(vitestRunner(), harness)
