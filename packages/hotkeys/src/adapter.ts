import { getHotkeyManager } from './hotkey-manager'
import {
  DEFAULT_SEQUENCE_TIMEOUT,
  getSequenceManager,
} from './sequence-manager'
import { normalizeRegisterableHotkey, parseHotkey } from './parse'
import { defaultHotkeyOptions, getDefaultIgnoreInputs } from './_registration'
import { detectPlatform } from './platform'
import type { HotkeyCallback, RegisterableHotkey } from './hotkey.types'
import type { HotkeyOptions, HotkeyRegistrationHandle } from './hotkey-manager'
import type { HotkeySequence, SequenceOptions } from './sequence-manager'

/** A hotkey and its callback, with optional per-binding options. */
export interface HotkeyDefinition {
  hotkey: RegisterableHotkey
  callback: HotkeyCallback
  options?: HotkeyOptions
}

/** A sequence and its callback, with optional per-binding options. */
export interface HotkeySequenceDefinition {
  sequence: HotkeySequence
  callback: HotkeyCallback
  options?: SequenceOptions
}

type PreparedBinding<TOptions extends HotkeyOptions> = {
  key: string
  callback: HotkeyCallback
  options: TOptions
  register: () => HotkeyRegistrationHandle
}

function createBindings<TOptions extends HotkeyOptions>() {
  const registrations = new Map<
    string,
    {
      handle: HotkeyRegistrationHandle
      target: HotkeyOptions['target']
      platform: HotkeyOptions['platform']
      options: TOptions
    }
  >()

  return {
    update(bindings: Array<PreparedBinding<TOptions>>) {
      const keys = new Set(bindings.map((binding) => binding.key))
      // Remove stale entries before registering replacements to avoid conflicts.
      for (const [key, registration] of registrations) {
        if (!keys.has(key)) {
          registration.handle.unregister()
          registrations.delete(key)
        }
      }
      for (const binding of bindings) {
        const previous = registrations.get(binding.key)
        const { target, platform } = binding.options
        if (
          previous?.handle.isActive &&
          previous.target === target &&
          previous.platform === platform
        ) {
          previous.handle.callback = binding.callback
          // setOptions merges, so explicitly reset options removed by the caller.
          const reset = Object.fromEntries(
            Object.keys(previous.options).map((key) => [key, undefined]),
          )
          previous.handle.setOptions({ ...reset, ...binding.options })
          previous.options = binding.options
        } else {
          previous?.handle.unregister()
          registrations.set(binding.key, {
            handle: binding.register(),
            target,
            platform,
            options: binding.options,
          })
        }
      }
    },
    destroy() {
      for (const { handle } of registrations.values()) handle.unregister()
      registrations.clear()
    },
  }
}

function resolveOptions<TOptions extends HotkeyOptions>(
  options: TOptions,
): TOptions {
  return {
    ...defaultHotkeyOptions,
    requireReset: false,
    ...options,
    ignoreInputs: options.ignoreInputs,
    target:
      'target' in options
        ? (options.target ?? null)
        : typeof document === 'undefined'
          ? null
          : document,
    platform: options.platform ?? detectPlatform(),
  }
}

/** Reconciles adapter registrations while retaining handles for option updates. */
export function createHotkeyBindings() {
  const bindings = createBindings<HotkeyOptions>()
  return {
    update(
      definitions: Array<HotkeyDefinition>,
      commonOptions: HotkeyOptions = {},
    ) {
      const prepared: Array<PreparedBinding<HotkeyOptions>> = []
      definitions.forEach((definition, index) => {
        const options = resolveOptions({
          ...commonOptions,
          ...definition.options,
        })
        if (!options.target) return
        const hotkey = normalizeRegisterableHotkey(
          definition.hotkey,
          options.platform,
        )
        options.ignoreInputs ??= getDefaultIgnoreInputs(
          parseHotkey(hotkey, options.platform),
        )
        prepared.push({
          key: `${index}:${hotkey}`,
          callback: definition.callback,
          options,
          register: () =>
            getHotkeyManager().register(hotkey, definition.callback, options),
        })
      })
      bindings.update(prepared)
    },
    destroy: bindings.destroy,
  }
}

/** Reconciles sequence bindings; empty sequences and explicit null targets are skipped. */
export function createHotkeySequenceBindings() {
  const bindings = createBindings<SequenceOptions>()
  return {
    update(
      definitions: Array<HotkeySequenceDefinition>,
      commonOptions: SequenceOptions = {},
    ) {
      const prepared: Array<PreparedBinding<SequenceOptions>> = []
      definitions.forEach((definition, index) => {
        const options = resolveOptions({
          timeout: DEFAULT_SEQUENCE_TIMEOUT,
          ...commonOptions,
          ...definition.options,
        })
        if (!options.target || definition.sequence.length === 0) return
        options.ignoreInputs ??= getDefaultIgnoreInputs(
          parseHotkey(definition.sequence[0]!, options.platform),
        )
        prepared.push({
          key: `${index}:${JSON.stringify(definition.sequence)}`,
          callback: definition.callback,
          options,
          register: () =>
            getSequenceManager().register(
              definition.sequence,
              definition.callback,
              options,
            ),
        })
      })
      bindings.update(prepared)
    },
    destroy: bindings.destroy,
  }
}
