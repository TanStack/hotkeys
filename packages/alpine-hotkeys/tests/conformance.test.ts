import { provideAppHotkeys } from '@tanstack/hotkeys'
import {
  entryKeys,
  runConformanceSuite,
} from '@tanstack/hotkeys-test-utils/conformance'
import { vitestRunner } from '@tanstack/hotkeys-test-utils/conformance/vitest'
import Alpine from 'alpinejs'
import { createHotkeyRecorder, createHotkeysScope } from '../src'
import type { IndividualKey, RegisterableHotkey } from '@tanstack/hotkeys'
import type {
  ConformanceHarness,
  ConformanceHotkey,
  ConformanceProvider,
  HotkeysSpec,
} from '@tanstack/hotkeys-test-utils/conformance'
import type {
  AlpineHotkeyDefinition,
  AlpineHotkeys,
  DefaultHotkeysOptions,
} from '../src'

const owners = new Set<AlpineHotkeys>()
const disposers = new Set<() => void>()

/** A hotkeys owner that the harness destroys after each case. */
function owner(defaults: () => DefaultHotkeysOptions = () => ({})) {
  const value = createHotkeysScope(defaults)
  owners.add(value)
  return {
    hotkeys: value,
    unmount: async () => {
      owners.delete(value)
      value.destroy()
      await Alpine.nextTick()
    },
  }
}

async function settle(change: () => unknown = () => {}) {
  change()
  await Alpine.nextTick()
}

/**
 * Alpine owners take default options but have no hotkey scopes. A platform
 * maps to the hotkey and recorder `platform` defaults.
 */
function defaultsFor(
  provider: ConformanceProvider | undefined,
): DefaultHotkeysOptions {
  if (!provider) return {}
  const platform = provider.platform
  return {
    hotkey: { ...(platform ? { platform } : {}), ...provider.hotkey },
    hotkeyRecorder: platform ? { platform } : {},
  }
}

/** Passes `target` only when the spec sets it, so other hotkeys use the document. */
function options(entry: ConformanceHotkey, element: HTMLElement) {
  if (!entry.options || !('target' in entry.options))
    return (entry.options ?? {}) as never
  return { ...entry.options, target: element } as never
}

const harness: ConformanceHarness = {
  name: 'Alpine',
  unsupported: {
    'callback-identity':
      'createHotkey keeps its first callback; callbacks read Alpine state instead',
    'provider-scope':
      'createHotkeysScope owns registrations but has no hotkey scope; use core activateScope',
    format: 'there is no format helper; use core formatForDisplay',
  },
  knownBugs: {
    // issues/bugs/BUG-067-key-hold-case-rules-differ-across-adapters.md
    'key hold > folds the case of a letter like core isKeyHeld': 'BUG-067',
  },
  act: settle,
  async cleanup() {
    for (const dispose of disposers) dispose()
    disposers.clear()
    for (const value of owners) value.destroy()
    owners.clear()
    document.body.replaceChildren()
    await Alpine.nextTick()
  },

  async mountHeldKeys(watch) {
    const { hotkeys, unmount } = owner()
    const state = Alpine.reactive({ key: watch as IndividualKey })
    const keys = hotkeys.createHeldKeys()
    const codes = hotkeys.createHeldKeyCodes()
    const hold = hotkeys.createKeyHold(() => state.key)
    await settle()
    return {
      keys: () => [...keys.value],
      codes: () => ({ ...codes.value }),
      held: () => hold.value,
      setKey: (key) => settle(() => (state.key = key)),
      unmount,
    }
  },

  async mountRegistrations() {
    const { hotkeys, unmount } = owner()
    const registrations = hotkeys.createHotkeyRegistrations()
    // Render the count the way an x-text binding would.
    const output = document.body.appendChild(document.createElement('output'))
    const stop = Alpine.effect(() => {
      output.textContent = String(registrations.hotkeys.length)
    })
    await settle()
    return {
      list: () => registrations.hotkeys,
      rendered: () => Number(output.textContent),
      unmount: async () => {
        Alpine.release(stop)
        await unmount()
      },
    }
  },

  async mountHotkeys(initial) {
    // A raw spec plus a reactive version, so Alpine doesn't proxy the
    // entries and app hotkeys keep their identity.
    let spec: HotkeysSpec = initial
    const version = Alpine.reactive({ value: 0 })
    const current = () => {
      void version.value
      return spec
    }
    const element = document.body.appendChild(document.createElement('div'))
    element.tabIndex = 0
    const app = initial.provider?.appHotkeys
      ? provideAppHotkeys(initial.provider.appHotkeys, {
          customHotkeys: initial.provider.customHotkeys ?? undefined,
        })
      : undefined
    if (app) disposers.add(app.dispose)
    const defaults = () => defaultsFor(current().provider)

    const owned: Array<{ unmount: () => Promise<void> }> = []
    // One owner per callback, so changing an entry updates it in place.
    const singles = new Map<string, ReturnType<typeof owner>>()
    const syncSingles = () => {
      const keys = entryKeys(spec.hotkeys)
      for (const [key, value] of singles) {
        if (!keys.includes(key)) {
          singles.delete(key)
          void value.unmount()
        }
      }
      keys.forEach((key, index) => {
        if (singles.has(key)) return
        const single = owner(defaults)
        const entry = () =>
          current().hotkeys[entryKeys(current().hotkeys).indexOf(key)] ??
          spec.hotkeys[index]!
        single.hotkeys.createHotkey(
          () => entry().hotkey as RegisterableHotkey,
          spec.hotkeys[index]!.callback,
          () => options(entry(), element),
        )
        singles.set(key, single)
      })
    }

    if (initial.form === 'list') {
      const list = owner(defaults)
      owned.push(list)
      list.hotkeys.createHotkeys(
        () =>
          current().hotkeys.map((entry) => ({
            hotkey: entry.hotkey,
            callback: entry.callback,
            options: options(entry, element),
          })) as Array<AlpineHotkeyDefinition>,
      )
    } else {
      syncSingles()
    }
    await settle()

    return {
      update: (next) =>
        settle(() => {
          spec = { ...spec, ...next }
          if (next.provider && app) {
            app.store.setOptions({
              customHotkeys: next.provider.customHotkeys ?? undefined,
            })
          }
          if (spec.form === 'single') syncSingles()
          version.value++
        }),
      element: () => element,
      unmount: async () => {
        for (const value of [...owned, ...singles.values()]) {
          await value.unmount()
        }
        singles.clear()
        if (app) {
          app.dispose()
          disposers.delete(app.dispose)
        }
        element.remove()
        await Alpine.nextTick()
      },
    }
  },

  async mountRecorder({ options: recorderOptions, provider }) {
    const { hotkeys, unmount } = owner(() => defaultsFor(provider))
    const recorder = createHotkeyRecorder(hotkeys, recorderOptions as never)
    await settle()
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
      unmount,
    }
  },

  async mountHint(initial) {
    const { hotkeys, unmount } = owner()
    let hotkey = initial.hotkey
    const version = Alpine.reactive({ value: 0 })
    const hint = hotkeys.createHotkeyHint(() => {
      void version.value
      return hotkey
    }, initial.options)
    await settle()
    return {
      value: () => hint.value,
      setHotkey: (next) =>
        settle(() => {
          hotkey = next
          version.value++
        }),
      unmount,
    }
  },
}

runConformanceSuite(vitestRunner(), harness)
