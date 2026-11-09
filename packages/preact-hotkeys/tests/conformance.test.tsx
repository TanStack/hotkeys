import { runConformanceSuite } from '@tanstack/hotkeys-test-utils/conformance'
import { vitestRunner } from '@tanstack/hotkeys-test-utils/conformance/vitest'
import { act, cleanup, render } from '@testing-library/preact'
import { useRef } from 'preact/hooks'
import {
  HotkeysProvider,
  useFormatForDisplay,
  useHeldKeyCodes,
  useHeldKeys,
  useHotkey,
  useHotkeyHint,
  useHotkeyRecorder,
  useHotkeyRegistrations,
  useHotkeys,
  useKeyHold,
} from '../src'
import type {
  HotkeyRegistrationView,
  IndividualKey,
  formatForDisplay,
} from '@tanstack/hotkeys'
import type {
  ConformanceHarness,
  ConformanceHotkey,
  ConformanceProvider,
  HintSpec,
  HotkeysSpec,
  RecorderState,
} from '@tanstack/hotkeys-test-utils/conformance'
import type { ComponentChildren, RefObject } from 'preact'
import type { UseHotkeyDefinition } from '../src'

function Provider({
  provider,
  children,
}: {
  provider?: ConformanceProvider
  children: ComponentChildren
}) {
  if (!provider) return <>{children}</>
  const { hotkey, platform, ...props } = provider
  return (
    <HotkeysProvider {...props} defaultOptions={{ hotkey, platform }}>
      {children}
    </HotkeysProvider>
  )
}

/** Passes `target` only when the spec sets it, so other hotkeys use the document. */
function options(
  entry: ConformanceHotkey,
  element: RefObject<HTMLDivElement | null>,
) {
  if (!entry.options || !('target' in entry.options))
    return entry.options as never
  return { ...entry.options, target: element } as never
}

function One({
  entry,
  element,
}: {
  entry: ConformanceHotkey
  element: RefObject<HTMLDivElement | null>
}) {
  useHotkey(entry.hotkey as never, entry.callback, options(entry, element))
  return null
}

function List({
  hotkeys,
  element,
}: {
  hotkeys: Array<ConformanceHotkey>
  element: RefObject<HTMLDivElement | null>
}) {
  useHotkeys(
    hotkeys.map((entry) => ({
      hotkey: entry.hotkey,
      callback: entry.callback,
      options: options(entry, element),
    })) as Array<UseHotkeyDefinition>,
  )
  return null
}

function HotkeysView({
  spec,
  onElement,
}: {
  spec: HotkeysSpec
  onElement: (element: HTMLDivElement | null) => void
}) {
  const element = useRef<HTMLDivElement | null>(null)
  return (
    <Provider provider={spec.provider}>
      <div
        tabIndex={0}
        ref={(node) => {
          element.current = node
          onElement(node)
        }}
      />
      {spec.form === 'list' ? (
        <List hotkeys={spec.hotkeys} element={element} />
      ) : (
        spec.hotkeys.map((entry, index) => (
          <One key={index} entry={entry} element={element} />
        ))
      )}
    </Provider>
  )
}

function HeldKeysView({ watch }: { watch: IndividualKey }) {
  const keys = useHeldKeys()
  const codes = useHeldKeyCodes()
  const held = useKeyHold(watch)
  return (
    <div>
      <output data-testid="keys">{JSON.stringify(keys)}</output>
      <output data-testid="codes">{JSON.stringify(codes)}</output>
      <output data-testid="held">{String(held)}</output>
    </div>
  )
}

function RegistrationsView({
  onValue,
}: {
  onValue: (value: Array<HotkeyRegistrationView>) => void
}) {
  const registrations = useHotkeyRegistrations()
  onValue(registrations)
  return <output data-testid="count">{registrations.length}</output>
}

function HintView({ spec }: { spec: HintSpec }) {
  const hint = useHotkeyHint(spec.hotkey, spec.options)
  return <output data-testid="hint">{String(hint)}</output>
}

const harness: ConformanceHarness = {
  name: 'Preact',
  knownBugs: {
    // issues/bugs/BUG-067-key-hold-case-rules-differ-across-adapters.md
    'key hold > matches named keys case-sensitively like core isKeyHeld':
      'BUG-067',
  },
  act: (change) => act(() => void change()),
  cleanup,

  mountHeldKeys(watch) {
    const view = render(<HeldKeysView watch={watch} />)
    const text = (id: string) => view.getByTestId(id).textContent ?? ''
    return {
      keys: () => JSON.parse(text('keys')),
      codes: () => JSON.parse(text('codes')),
      held: () => text('held') === 'true',
      setKey: (key) => view.rerender(<HeldKeysView watch={key} />),
      unmount: () => act(() => view.unmount()),
    }
  },

  mountRegistrations() {
    let latest: Array<HotkeyRegistrationView> = []
    const view = render(
      <RegistrationsView onValue={(value) => (latest = value)} />,
    )
    return {
      list: () => latest,
      rendered: () => Number(view.getByTestId('count').textContent),
      unmount: () => act(() => view.unmount()),
    }
  },

  mountHotkeys(initial) {
    let spec = initial
    let element: HTMLDivElement | null = null
    const onElement = (node: HTMLDivElement | null) => (element = node)
    const view = render(<HotkeysView spec={spec} onElement={onElement} />)
    return {
      update(next) {
        spec = { ...spec, ...next }
        view.rerender(<HotkeysView spec={spec} onElement={onElement} />)
      },
      element: () => element!,
      unmount: () => act(() => view.unmount()),
    }
  },

  mountRecorder({ options, provider }) {
    let recorder!: ReturnType<typeof useHotkeyRecorder>
    function RecorderView() {
      recorder = useHotkeyRecorder(options as never)
      return null
    }
    const view = render(
      <Provider provider={provider}>
        <RecorderView />
      </Provider>,
    )
    const run = (change: () => void) => act(change)
    return {
      state: (): RecorderState => ({
        isRecording: recorder.isRecording,
        steps: recorder.steps,
        recordedHotkey: recorder.recordedHotkey,
      }),
      start: () => run(() => recorder.startRecording()),
      stop: () => run(() => recorder.stopRecording()),
      cancel: () => run(() => recorder.cancelRecording()),
      commit: () => run(() => recorder.commitRecording()),
      unmount: () => act(() => view.unmount()),
    }
  },

  mountHint(initial) {
    let spec = initial
    const view = render(<HintView spec={spec} />)
    return {
      value: () => view.getByTestId('hint').textContent === 'true',
      setHotkey(hotkey) {
        spec = { ...spec, hotkey }
        view.rerender(<HintView spec={spec} />)
      },
      unmount: () => act(() => view.unmount()),
    }
  },

  mountFormat({ platform }) {
    let format!: typeof formatForDisplay
    function FormatView() {
      format = useFormatForDisplay()
      return null
    }
    const view = render(
      <Provider provider={platform ? { platform } : undefined}>
        <FormatView />
      </Provider>,
    )
    return {
      format: (hotkey, formatOptions) => format(hotkey, formatOptions ?? {}),
      unmount: () => act(() => view.unmount()),
    }
  },
}

runConformanceSuite(vitestRunner(), harness)
