import { runConformanceSuite } from '@tanstack/hotkeys-test-utils/conformance'
import { vitestRunner } from '@tanstack/hotkeys-test-utils/conformance/vitest'
import { flushSync, mount, unmount } from 'svelte'
import Format from './conformance/Format.svelte'
import HeldKeysView from './conformance/HeldKeysView.svelte'
import Hint from './conformance/Hint.svelte'
import Hotkeys from './conformance/Hotkeys.svelte'
import Recorder from './conformance/Recorder.svelte'
import RegistrationsView from './conformance/RegistrationsView.svelte'
import Wrap from './conformance/Wrap.svelte'
import { cell } from './conformance/cell.svelte'
import type {
  HotkeyRegistrationView,
  IndividualKey,
  formatForDisplay,
} from '@tanstack/hotkeys'
import type { ConformanceHarness } from '@tanstack/hotkeys-test-utils/conformance'
import type { Component } from 'svelte'
import type { SvelteHotkeyRecorder } from '../src/createHotkeyRecorder.svelte'

const mounted = new Set<() => void>()

/** Mounts a component in its own container and flushes. */
function render(component: Component<any>, props: Record<string, unknown>) {
  const target = document.body.appendChild(document.createElement('div'))
  const instance = mount(component, { target, props })
  flushSync()
  const remove = () => {
    if (!mounted.delete(remove)) return
    void unmount(instance)
    flushSync()
    target.remove()
  }
  mounted.add(remove)
  return {
    text: (id: string) =>
      target.querySelector(`[data-testid="${id}"]`)?.textContent ?? '',
    unmount: remove,
  }
}

const harness: ConformanceHarness = {
  name: 'Svelte',
  unsupported: {
    'callback-identity':
      'createHotkey keeps its first callback; callbacks read state instead',
  },
  knownBugs: {
    // issues/bugs/BUG-067-key-hold-case-rules-differ-across-adapters.md
    'key hold > matches named keys case-sensitively like core isKeyHeld':
      'BUG-067',
  },
  act(change) {
    change()
    flushSync()
  },
  cleanup() {
    for (const remove of [...mounted]) remove()
  },

  mountHeldKeys(watch) {
    let setKey!: (key: IndividualKey) => void
    const view = render(HeldKeysView, {
      watch,
      ready: (update: typeof setKey) => (setKey = update),
    })
    return {
      keys: () => JSON.parse(view.text('keys')),
      codes: () => JSON.parse(view.text('codes')),
      held: () => view.text('held') === 'true',
      setKey(key) {
        setKey(key)
        flushSync()
      },
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
    const spec = cell(initial)
    let element: HTMLElement | undefined
    const view = render(Hotkeys, {
      get spec() {
        return spec.value
      },
      onElement: (node: HTMLElement) => (element = node),
    })
    return {
      update(next) {
        spec.value = { ...spec.value, ...next }
        flushSync()
      },
      element: () => element!,
      unmount: view.unmount,
    }
  },

  mountRecorder({ options, provider }) {
    let recorder!: SvelteHotkeyRecorder
    const view = render(Wrap, {
      provider,
      view: Recorder,
      props: {
        options,
        ready: (value: SvelteHotkeyRecorder) => (recorder = value),
      },
    })
    const run = (change: () => void) => {
      change()
      flushSync()
    }
    return {
      state: () => ({
        isRecording: recorder.isRecording,
        steps: recorder.steps,
        recordedHotkey: recorder.recordedHotkey,
      }),
      start: () => run(() => recorder.startRecording()),
      stop: () => run(() => recorder.stopRecording()),
      cancel: () => run(() => recorder.cancelRecording()),
      commit: () => run(() => recorder.commitRecording()),
      unmount: view.unmount,
    }
  },

  mountHint({ hotkey, options }) {
    const current = cell(hotkey)
    const view = render(Hint, {
      get hotkey() {
        return current.value
      },
      options,
    })
    return {
      value: () => view.text('hint') === 'true',
      setHotkey(next) {
        current.value = next
        flushSync()
      },
      unmount: view.unmount,
    }
  },

  mountFormat({ platform }) {
    let format!: typeof formatForDisplay
    const view = render(Wrap, {
      provider: platform ? { platform } : undefined,
      view: Format,
      props: { ready: (value: typeof formatForDisplay) => (format = value) },
    })
    return {
      format: (hotkey, formatOptions) => format(hotkey, formatOptions),
      unmount: view.unmount,
    }
  },
}

runConformanceSuite(vitestRunner(), harness)
