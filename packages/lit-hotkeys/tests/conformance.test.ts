import { provideAppHotkeys } from '@tanstack/hotkeys'
import {
  entryKeys,
  runConformanceSuite,
} from '@tanstack/hotkeys-test-utils/conformance'
import { vitestRunner } from '@tanstack/hotkeys-test-utils/conformance/vitest'
import { LitElement, html } from 'lit'
import { HeldKeyCodesController } from '../src/controllers/held-key-codes'
import { HeldKeysController } from '../src/controllers/held-keys'
import { HotkeyController } from '../src/controllers/hotkey'
import { HotkeyHintController } from '../src/controllers/hotkey-hint'
import { HotkeyRecorderController } from '../src/controllers/hotkey-recorder'
import { HotkeyRegistrationsController } from '../src/controllers/hotkey-registrations'
import { KeyHoldController } from '../src/controllers/key-hold'
import type { IndividualKey, RegisterableHotkey } from '@tanstack/hotkeys'
import type {
  ConformanceHarness,
  ConformanceHotkey,
  HotkeysSpec,
} from '@tanstack/hotkeys-test-utils/conformance'
import type { TemplateResult } from 'lit'

/** A Lit element that renders whatever its controllers expose. */
class ConformanceHost extends LitElement {
  view: () => TemplateResult | null = () => null
  override render() {
    return this.view()
  }
}
customElements.define('conformance-host', ConformanceHost)

const containers = new Set<HTMLElement>()

/** Renders hosts in a new container and waits for their first update. */
async function attach(...hosts: Array<ConformanceHost>) {
  const container = document.body.appendChild(document.createElement('div'))
  containers.add(container)
  container.append(...hosts)
  await settle()
  return {
    container,
    unmount: async () => {
      containers.delete(container)
      container.remove()
      await settle()
    },
  }
}

/** Waits until every mounted host has finished updating. */
async function settle(change: () => unknown = () => {}) {
  change()
  for (let pass = 0; pass < 3; pass++) {
    const hosts = [...document.querySelectorAll('conformance-host')]
    await Promise.all(
      hosts.map((host) => (host as ConformanceHost).updateComplete),
    )
  }
}

function text(host: ConformanceHost, id: string) {
  return (
    host.renderRoot.querySelector(`[data-testid="${id}"]`)?.textContent ?? ''
  )
}

/** Passes `target` only when the spec sets it, so other hotkeys use the document. */
function options(entry: ConformanceHotkey, element: HTMLElement) {
  if (!entry.options || !('target' in entry.options))
    return (entry.options ?? {}) as never
  return { ...entry.options, target: element } as never
}

const harness: ConformanceHarness = {
  name: 'Lit',
  unsupported: {
    'callback-identity':
      'HotkeyController binds its first callback; callbacks read properties instead',
    'list-form': 'there is no list controller; use one HotkeyController each',
    'provider-scope':
      'there is no provider; scopes come from core activateScope',
    'provider-defaults': 'there is no provider for default options',
    format: 'there is no format controller; use core formatForDisplay',
  },
  act: settle,
  async cleanup() {
    for (const container of containers) container.remove()
    containers.clear()
    await settle()
  },

  async mountHeldKeys(watch) {
    const host = new ConformanceHost()
    let key: IndividualKey = watch
    const keys = new HeldKeysController(host)
    const codes = new HeldKeyCodesController(host)
    const hold = new KeyHoldController(host, () => key)
    host.view = () => html`
      <output data-testid="keys">${JSON.stringify(keys.value)}</output>
      <output data-testid="codes">${JSON.stringify(codes.value)}</output>
      <output data-testid="held">${String(hold.value)}</output>
    `
    const view = await attach(host)
    return {
      keys: () => JSON.parse(text(host, 'keys')),
      codes: () => JSON.parse(text(host, 'codes')),
      held: () => text(host, 'held') === 'true',
      setKey: (next) =>
        settle(() => {
          key = next
          host.requestUpdate()
        }),
      unmount: view.unmount,
    }
  },

  async mountRegistrations() {
    const host = new ConformanceHost()
    const registrations = new HotkeyRegistrationsController(host)
    host.view = () =>
      html`<output data-testid="count">${registrations.hotkeys.length}</output>`
    const view = await attach(host)
    return {
      list: () => registrations.hotkeys,
      rendered: () => Number(text(host, 'count')),
      unmount: view.unmount,
    }
  },

  async mountHotkeys(initial) {
    if (
      initial.provider &&
      Object.keys(initial.provider).some(
        (key) => key !== 'appHotkeys' && key !== 'customHotkeys',
      )
    ) {
      throw new Error('Lit has no provider for scopes or defaults')
    }
    let spec: HotkeysSpec = initial
    const element = document.createElement('div')
    element.tabIndex = 0
    const app = initial.provider?.appHotkeys
      ? provideAppHotkeys(initial.provider.appHotkeys, {
          customHotkeys: initial.provider.customHotkeys ?? undefined,
        })
      : undefined
    // One host per callback, so changing an entry updates its controller.
    const hosts = new Map<
      string,
      ConformanceHost & { entry?: ConformanceHotkey }
    >()
    const view = await attach()
    view.container.append(element)

    const sync = () => {
      const keys = entryKeys(spec.hotkeys)
      for (const [key, host] of hosts) {
        if (!keys.includes(key)) {
          host.remove()
          hosts.delete(key)
        }
      }
      keys.forEach((key, index) => {
        const entry = spec.hotkeys[index]!
        let host = hosts.get(key)
        if (!host) {
          const created: ConformanceHost & { entry?: ConformanceHotkey } =
            new ConformanceHost()
          created.entry = entry
          new HotkeyController(
            created,
            () => created.entry!.hotkey as RegisterableHotkey,
            entry.callback,
            () => options(created.entry!, element),
          )
          hosts.set(key, (host = created))
          view.container.append(host)
        }
        host.entry = entry
        host.requestUpdate()
      })
    }
    await settle(sync)

    return {
      update: (next) =>
        settle(() => {
          spec = { ...spec, ...next }
          if (next.provider && app) {
            app.store.setOptions({
              customHotkeys: next.provider.customHotkeys ?? undefined,
            })
          }
          sync()
        }),
      element: () => element,
      unmount: async () => {
        app?.dispose()
        await view.unmount()
      },
    }
  },

  async mountRecorder({ options: recorderOptions }) {
    const host = new ConformanceHost()
    const recorder = new HotkeyRecorderController(
      host,
      recorderOptions as never,
    )
    const view = await attach(host)
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

  async mountHint(initial) {
    const host = new ConformanceHost()
    let hotkey = initial.hotkey
    const hint = new HotkeyHintController(host, () => hotkey, initial.options)
    host.view = () =>
      html`<output data-testid="hint">${String(hint.value)}</output>`
    const view = await attach(host)
    return {
      value: () => text(host, 'hint') === 'true',
      setHotkey: (next) =>
        settle(() => {
          hotkey = next
          host.requestUpdate()
        }),
      unmount: view.unmount,
    }
  },
}

runConformanceSuite(vitestRunner(), harness)
