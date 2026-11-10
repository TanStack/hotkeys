import {
  entryKeys,
  runConformanceSuite,
} from '@tanstack/hotkeys-test-utils/conformance'
import { vitestRunner } from '@tanstack/hotkeys-test-utils/conformance/vitest'
import { createApp, defineComponent, h, nextTick, ref, shallowRef } from 'vue'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useFormatForDisplay } from '../src/useFormatForDisplay'
import { useHeldKeyCodes } from '../src/useHeldKeyCodes'
import { useHeldKeys } from '../src/useHeldKeys'
import { useHotkey } from '../src/useHotkey'
import { useHotkeyHint } from '../src/useHotkeyHint'
import { useHotkeyRecorder } from '../src/useHotkeyRecorder'
import { useHotkeyRegistrations } from '../src/useHotkeyRegistrations'
import { useHotkeys } from '../src/useHotkeys'
import { useKeyHold } from '../src/useKeyHold'
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
import type { Ref, VNodeChild } from 'vue'
import type { VueHotkeyRecorder } from '../src/useHotkeyRecorder'
import type { UseHotkeyDefinition } from '../src/useHotkeys'

const mounted = new Set<() => void>()

/** Mounts a render function in its own app and waits for the first render. */
async function render(setup: () => () => VNodeChild) {
  const target = document.body.appendChild(document.createElement('div'))
  const app = createApp(defineComponent({ setup }))
  app.mount(target)
  await nextTick()
  const remove = async () => {
    if (!mounted.delete(remove)) return
    app.unmount()
    target.remove()
    await nextTick()
  }
  mounted.add(remove)
  return {
    text: (id: string) =>
      target.querySelector(`[data-testid="${id}"]`)?.textContent ?? '',
    unmount: remove,
  }
}

function withProvider(
  provider: ConformanceProvider | undefined,
  children: () => VNodeChild,
): VNodeChild {
  if (!provider) return children()
  const { hotkey, platform, ...props } = provider
  return h(
    HotkeysProvider,
    { ...props, defaultOptions: { hotkey, platform } } as never,
    { default: children },
  )
}

/** Passes `target` only when the spec sets it, so other hotkeys use the document. */
function options(entry: ConformanceHotkey, element: Ref<HTMLElement | null>) {
  if (!entry.options || !('target' in entry.options))
    return (entry.options ?? {}) as never
  return { ...entry.options, target: element } as never
}

const HotkeyOne = defineComponent({
  props: {
    entry: { type: Object as () => ConformanceHotkey, required: true },
    element: { type: Object as () => Ref<HTMLElement | null>, required: true },
  },
  setup(props) {
    // useHotkey keeps its first callback; entries are keyed by callback.
    useHotkey(
      () => props.entry.hotkey as RegisterableHotkey,
      props.entry.callback,
      () => options(props.entry, props.element),
    )
    return () => null
  },
})

const HotkeyList = defineComponent({
  props: {
    hotkeys: { type: Array as () => Array<ConformanceHotkey>, required: true },
    element: { type: Object as () => Ref<HTMLElement | null>, required: true },
  },
  setup(props) {
    useHotkeys(
      () =>
        props.hotkeys.map((entry) => ({
          hotkey: entry.hotkey,
          callback: entry.callback,
          options: options(entry, props.element),
        })) as Array<UseHotkeyDefinition>,
    )
    return () => null
  },
})

const settle = async (change: () => unknown) => {
  change()
  await nextTick()
}

const harness: ConformanceHarness = {
  name: 'Vue',
  unsupported: {
    'callback-identity':
      'useHotkey keeps its first callback; callbacks read refs instead',
  },
  act: settle,
  async cleanup() {
    for (const remove of [...mounted]) await remove()
  },

  async mountHeldKeys(watch) {
    const key = ref<IndividualKey>(watch)
    const view = await render(() => {
      const keys = useHeldKeys()
      const codes = useHeldKeyCodes()
      const held = useKeyHold(key)
      return () => [
        h('output', { 'data-testid': 'keys' }, JSON.stringify(keys.value)),
        h('output', { 'data-testid': 'codes' }, JSON.stringify(codes.value)),
        h('output', { 'data-testid': 'held' }, String(held.value)),
      ]
    })
    return {
      keys: () => JSON.parse(view.text('keys')),
      codes: () => JSON.parse(view.text('codes')),
      held: () => view.text('held') === 'true',
      setKey: (next) => settle(() => (key.value = next)),
      unmount: view.unmount,
    }
  },

  async mountRegistrations() {
    let registrations!: Readonly<Ref<Array<HotkeyRegistrationView>>>
    const view = await render(() => {
      registrations = useHotkeyRegistrations()
      return () =>
        h('output', { 'data-testid': 'count' }, registrations.value.length)
    })
    return {
      list: () => registrations.value,
      rendered: () => Number(view.text('count')),
      unmount: view.unmount,
    }
  },

  async mountHotkeys(initial) {
    const spec = shallowRef<HotkeysSpec>(initial)
    const element = ref<HTMLElement | null>(null)
    const view = await render(() => () => {
      const { form, hotkeys, provider } = spec.value
      // One component per callback, so changing an entry updates it in place.
      const keys = entryKeys(hotkeys)
      return withProvider(provider, () => [
        h('div', { tabindex: 0, ref: element }),
        form === 'list'
          ? h(HotkeyList, { hotkeys, element })
          : keys.map((key, index) =>
              h(HotkeyOne, { key, entry: hotkeys[index]!, element }),
            ),
      ])
    })
    return {
      update: (next) => settle(() => (spec.value = { ...spec.value, ...next })),
      element: () => element.value!,
      unmount: view.unmount,
    }
  },

  async mountRecorder({ options: recorderOptions, provider }) {
    let recorder!: VueHotkeyRecorder
    const Recorder = defineComponent({
      setup() {
        recorder = useHotkeyRecorder(recorderOptions as never)
        return () => null
      },
    })
    const view = await render(
      () => () => withProvider(provider, () => h(Recorder)),
    )
    return {
      state: () => ({
        isRecording: recorder.isRecording.value,
        steps: recorder.steps.value,
        recordedHotkey: recorder.recordedHotkey.value,
      }),
      start: () => settle(() => recorder.startRecording()),
      stop: () => settle(() => recorder.stopRecording()),
      cancel: () => settle(() => recorder.cancelRecording()),
      commit: () => settle(() => recorder.commitRecording()),
      unmount: view.unmount,
    }
  },

  async mountHint(initial) {
    const hotkey = shallowRef(initial.hotkey)
    const view = await render(() => {
      const hint = useHotkeyHint(hotkey, initial.options)
      return () => h('output', { 'data-testid': 'hint' }, String(hint.value))
    })
    return {
      value: () => view.text('hint') === 'true',
      setHotkey: (next) => settle(() => (hotkey.value = next)),
      unmount: view.unmount,
    }
  },

  async mountFormat({ platform }) {
    let format!: typeof formatForDisplay
    const Format = defineComponent({
      setup() {
        format = useFormatForDisplay()
        return () => null
      },
    })
    const view = await render(
      () => () =>
        withProvider(platform ? { platform } : undefined, () => h(Format)),
    )
    return {
      format: (hotkey, formatOptions) => format(hotkey, formatOptions ?? {}),
      unmount: view.unmount,
    }
  },
}

runConformanceSuite(vitestRunner(), harness)
