import { runConformanceSuite } from '@tanstack/hotkeys-test-utils/conformance'
import { vitestRunner } from '@tanstack/hotkeys-test-utils/conformance/vitest'
import { createRoot, flushSync } from 'octane'
import {
  FormatView,
  HeldKeysView,
  HintView,
  HotkeysView,
  RecorderView,
  RegistrationsView,
} from './conformance.tsrx'
import { flush } from './utils'
import type {
  ConformanceHarness,
  HotkeysSpec,
} from '@tanstack/hotkeys-test-utils/conformance'
import type {
  HotkeyRegistrationView,
  OctaneHotkeyRecorder,
  formatForDisplay,
} from '@tanstack/octane-hotkeys'

function settle(change: () => unknown) {
  flushSync(() => void change())
  flush()
}

const mounted = new Set<() => void>()

/** Renders a component in its own root. `rerender` passes new props. */
function render<P>(component: (props: P) => unknown, props: P) {
  const container = document.body.appendChild(document.createElement('div'))
  const root = createRoot(container)
  settle(() => root.render(component as never, props as never))
  const unmount = () => {
    if (!mounted.delete(unmount)) return
    root.unmount()
    flush()
    container.remove()
  }
  mounted.add(unmount)
  return {
    container,
    text: (id: string) =>
      container.querySelector(`[data-testid="${id}"]`)?.textContent ?? '',
    rerender: (next: P) =>
      settle(() => root.render(component as never, next as never)),
    unmount,
  }
}

const harness: ConformanceHarness = {
  name: 'Octane',
  act: settle,
  cleanup() {
    for (const unmount of [...mounted]) unmount()
  },

  mountHeldKeys(watch) {
    const view = render(HeldKeysView, { watch })
    return {
      keys: () => JSON.parse(view.text('keys')),
      codes: () => JSON.parse(view.text('codes')),
      held: () => view.text('held') === 'true',
      setKey: (key) => view.rerender({ watch: key }),
      unmount: view.unmount,
    }
  },

  mountRegistrations() {
    let latest: Array<HotkeyRegistrationView> = []
    const view = render(RegistrationsView, {
      onValue: (value: Array<HotkeyRegistrationView>) => (latest = value),
    })
    return {
      list: () => latest,
      rendered: () => Number(view.text('count')),
      unmount: view.unmount,
    }
  },

  mountHotkeys(initial) {
    let spec: HotkeysSpec = initial
    const view = render(HotkeysView, { spec })
    return {
      update(next) {
        spec = { ...spec, ...next }
        view.rerender({ spec })
      },
      element: () =>
        view.container.querySelector<HTMLElement>('[data-conformance-target]')!,
      unmount: view.unmount,
    }
  },

  mountRecorder({ options, provider }) {
    let recorder!: OctaneHotkeyRecorder
    const view = render(RecorderView, {
      provider,
      options,
      ready: (value: OctaneHotkeyRecorder) => (recorder = value),
    })
    return {
      state: () => ({
        isRecording: recorder.isRecording,
        steps: recorder.steps,
        recordedHotkey: recorder.recordedHotkey,
      }),
      start: () => settle(() => recorder.startRecording()),
      stop: () => settle(() => recorder.stopRecording()),
      cancel: () => settle(() => recorder.cancelRecording()),
      commit: () => settle(() => recorder.commitRecording()),
      unmount: view.unmount,
    }
  },

  mountHint(initial) {
    let spec = initial
    const view = render(HintView, spec)
    return {
      value: () => view.text('hint') === 'true',
      setHotkey(hotkey) {
        spec = { ...spec, hotkey }
        view.rerender(spec)
      },
      unmount: view.unmount,
    }
  },

  mountFormat({ platform }) {
    let format!: typeof formatForDisplay
    const view = render(FormatView, {
      provider: platform ? { platform } : undefined,
      ready: (value: typeof formatForDisplay) => (format = value),
    })
    return {
      format: (hotkey, options) => format(hotkey, options ?? {}),
      unmount: view.unmount,
    }
  },
}

runConformanceSuite(vitestRunner(), harness)
