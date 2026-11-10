import { cleanup, render } from '@solidjs/testing-library'
import {
  entryKeys,
  runConformanceSuite,
} from '@tanstack/hotkeys-test-utils/conformance'
import { vitestRunner } from '@tanstack/hotkeys-test-utils/conformance/vitest'
import { For, createMemo, createSignal } from 'solid-js'
import {
  HotkeysProvider,
  createFormatForDisplay,
  createHeldKeyCodes,
  createHeldKeys,
  createHotkey,
  createHotkeyHint,
  createHotkeyRecorder,
  createHotkeyRegistrations,
  createHotkeys,
  createKeyHold,
} from '../src'
import type {
  HotkeyRegistrationView,
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
import type { Accessor, JSX } from 'solid-js'
import type { CreateHotkeyDefinition, SolidHotkeyRecorder } from '../src'

/** Renders a provider when the view starts with one. Its props stay reactive. */
function withProvider(
  provider: Accessor<ConformanceProvider | undefined>,
  children: () => JSX.Element,
) {
  if (!provider()) return children()
  return (
    <HotkeysProvider
      scope={provider()?.scope}
      enabled={provider()?.enabled}
      exclusive={provider()?.exclusive}
      appHotkeys={provider()?.appHotkeys}
      customHotkeys={provider()?.customHotkeys as never}
      defaultOptions={{
        platform: provider()?.platform,
        hotkey: provider()?.hotkey,
      }}
    >
      {children()}
    </HotkeysProvider>
  )
}

/** Passes `target` only when the spec sets it, so other hotkeys use the document. */
function options(
  entry: ConformanceHotkey,
  element: Accessor<HTMLElement | null>,
) {
  if (!entry.options || !('target' in entry.options))
    return entry.options as never
  return { ...entry.options, target: element() } as never
}

const harness: ConformanceHarness = {
  name: 'Solid',
  unsupported: {
    'callback-identity':
      'createHotkey keeps its first callback; callbacks read signals instead',
  },
  act: (change) => void change(),
  cleanup,

  mountHeldKeys(watch) {
    const [key, setKey] = createSignal<IndividualKey>(watch)
    const view = render(() => {
      const keys = createHeldKeys()
      const codes = createHeldKeyCodes()
      const held = createKeyHold(key)
      return (
        <div>
          <output data-testid="keys">{JSON.stringify(keys())}</output>
          <output data-testid="codes">{JSON.stringify(codes())}</output>
          <output data-testid="held">{String(held())}</output>
        </div>
      )
    })
    const text = (id: string) => view.getByTestId(id).textContent ?? ''
    return {
      keys: () => JSON.parse(text('keys')),
      codes: () => JSON.parse(text('codes')),
      held: () => text('held') === 'true',
      setKey: (next) => void setKey(() => next),
      unmount: () => view.unmount(),
    }
  },

  mountRegistrations() {
    let registrations!: () => Array<HotkeyRegistrationView>
    const view = render(() => {
      registrations = createHotkeyRegistrations()
      return <output data-testid="count">{registrations().length}</output>
    })
    return {
      list: () => registrations(),
      rendered: () => Number(view.getByTestId('count').textContent),
      unmount: () => view.unmount(),
    }
  },

  mountHotkeys(initial) {
    const [spec, setSpec] = createSignal<HotkeysSpec>(initial)
    const [element, setElement] = createSignal<HTMLElement | null>(null)
    const view = render(() =>
      withProvider(
        () => spec().provider,
        () => (
          <>
            <div tabIndex={0} ref={setElement} />
            {spec().form === 'list' ? <List /> : <Singles />}
          </>
        ),
      ),
    )

    function List() {
      createHotkeys(
        () =>
          spec().hotkeys.map((entry) => ({
            hotkey: entry.hotkey,
            callback: entry.callback,
            options: options(entry, element),
          })) as Array<CreateHotkeyDefinition>,
      )
      return null
    }

    function Singles() {
      // One component per callback, so changing an entry updates it in place.
      const keys = createMemo(() => entryKeys(spec().hotkeys))
      const entry = (key: string) =>
        spec().hotkeys[keys().indexOf(key)] ?? spec().hotkeys[0]!
      return (
        <For each={keys()}>
          {(key) => {
            createHotkey(
              () => entry(key).hotkey as RegisterableHotkey,
              entry(key).callback,
              () => options(entry(key), element) ?? {},
            )
            return null
          }}
        </For>
      )
    }

    return {
      update: (next) => void setSpec((current) => ({ ...current, ...next })),
      element: () => element()!,
      unmount: () => view.unmount(),
    }
  },

  mountRecorder({ options: recorderOptions, provider }) {
    let recorder!: SolidHotkeyRecorder
    const view = render(() =>
      withProvider(
        () => provider,
        () => {
          recorder = createHotkeyRecorder(recorderOptions as never)
          return null
        },
      ),
    )
    return {
      state: () => ({
        isRecording: recorder.isRecording(),
        steps: recorder.steps(),
        recordedHotkey: recorder.recordedHotkey(),
      }),
      start: () => recorder.startRecording(),
      stop: () => recorder.stopRecording(),
      cancel: () => recorder.cancelRecording(),
      commit: () => recorder.commitRecording(),
      unmount: () => view.unmount(),
    }
  },

  mountHint(initial) {
    const [hotkey, setHotkey] = createSignal(initial.hotkey)
    const view = render(() => {
      const hint = createHotkeyHint(hotkey, initial.options)
      return <output data-testid="hint">{String(hint())}</output>
    })
    return {
      value: () => view.getByTestId('hint').textContent === 'true',
      setHotkey: (next) => void setHotkey(() => next),
      unmount: () => view.unmount(),
    }
  },

  mountFormat({ platform }) {
    let format!: typeof formatForDisplay
    const view = render(() =>
      withProvider(
        () => (platform ? { platform } : undefined),
        () => {
          format = createFormatForDisplay()
          return null
        },
      ),
    )
    return {
      format: (hotkey, formatOptions) => format(hotkey, formatOptions ?? {}),
      unmount: () => view.unmount(),
    }
  },
}

runConformanceSuite(vitestRunner(), harness)
