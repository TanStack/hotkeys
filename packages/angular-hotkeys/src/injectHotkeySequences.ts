import { DestroyRef, effect, inject } from '@angular/core'
import { formatHotkeySequence, getSequenceManager } from '@tanstack/hotkeys'
import { injectDefaultHotkeysOptions } from './hotkeys-provider'
import type { InjectHotkeySequenceOptions } from './injectHotkeySequence'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceRegistrationHandle,
} from '@tanstack/hotkeys'

/**
 * A single sequence definition for use with `injectHotkeySequences`.
 */
export interface InjectHotkeySequenceDefinition {
  /** Array of hotkey strings that form the sequence */
  sequence: HotkeySequence | (() => HotkeySequence)
  /** The function to call when the sequence is completed */
  callback: HotkeyCallback
  /** Per-sequence options (merged on top of commonOptions) */
  options?: InjectHotkeySequenceOptions | (() => InjectHotkeySequenceOptions)
}

/**
 * Angular inject-based API for registering multiple keyboard shortcut sequences at once (Vim-style).
 *
 * Uses the singleton SequenceManager. Call in an injection context (e.g. constructor).
 * Uses `effect()` to track reactive dependencies when definitions or options are getters.
 *
 * Options are merged in this order:
 * provideHotkeys defaults < commonOptions < per-definition options
 *
 * Definitions with an empty `sequence` are skipped. Disabled sequences (`enabled: false`)
 * remain registered so they stay visible in devtools; the core manager suppresses execution.
 *
 * @param sequences - Array of sequence definitions, or getter returning them
 * @param commonOptions - Shared options for all sequences, or getter
 *
 * @example
 * ```ts
 * @Component({ ... })
 * export class VimComponent {
 *   constructor() {
 *     injectHotkeySequences([
 *       { sequence: ['G', 'G'], callback: () => this.goTop() },
 *       { sequence: ['D', 'D'], callback: () => this.deleteLine() },
 *     ])
 *   }
 * }
 * ```
 */
export function injectHotkeySequences(
  sequences:
    | Array<InjectHotkeySequenceDefinition>
    | (() => Array<InjectHotkeySequenceDefinition>),
  commonOptions:
    | InjectHotkeySequenceOptions
    | (() => InjectHotkeySequenceOptions) = {},
): void {
  type RegistrationRecord = {
    handle: SequenceRegistrationHandle
    target: Document | HTMLElement | Window
  }

  const defaultOptions = injectDefaultHotkeysOptions()
  const manager = getSequenceManager()
  const destroyRef = inject(DestroyRef)

  const registrations = new Map<string, RegistrationRecord>()

  destroyRef.onDestroy(() => {
    for (const { handle } of registrations.values()) {
      if (handle.isActive) {
        handle.unregister()
      }
    }
    registrations.clear()
  })

  effect(() => {
    const resolvedSequences =
      typeof sequences === 'function' ? sequences() : sequences
    const resolvedCommonOptions =
      typeof commonOptions === 'function' ? commonOptions() : commonOptions

    const nextKeys = new Set<string>()
    const prepared: Array<{
      registrationKey: string
      def: InjectHotkeySequenceDefinition
      resolvedSequence: HotkeySequence
      enabled: boolean
      sequenceOpts: Omit<InjectHotkeySequenceOptions, 'enabled'>
      resolvedTarget: Document | HTMLElement | Window
    }> = []

    for (let i = 0; i < resolvedSequences.length; i++) {
      const def = resolvedSequences[i]!
      const resolvedSequence =
        typeof def.sequence === 'function' ? def.sequence() : def.sequence
      const resolvedDefOptions =
        typeof def.options === 'function' ? def.options() : (def.options ?? {})

      const mergedOptions = {
        ...defaultOptions.hotkeySequence,
        ...resolvedCommonOptions,
        ...resolvedDefOptions,
      } as InjectHotkeySequenceOptions

      const { enabled = true, ...sequenceOpts } = mergedOptions

      if (resolvedSequence.length === 0) {
        continue
      }

      const resolvedTarget =
        'target' in sequenceOpts
          ? (sequenceOpts.target ?? null)
          : typeof document !== 'undefined'
            ? document
            : null

      if (!resolvedTarget) {
        continue
      }

      const registrationKey = `${i}:${formatHotkeySequence(resolvedSequence)}`
      nextKeys.add(registrationKey)
      prepared.push({
        registrationKey,
        def,
        resolvedSequence,
        enabled,
        sequenceOpts,
        resolvedTarget,
      })
    }

    for (const [key, record] of [...registrations.entries()]) {
      if (!nextKeys.has(key)) {
        if (record.handle.isActive) {
          record.handle.unregister()
        }
        registrations.delete(key)
      }
    }

    for (const p of prepared) {
      const existing = registrations.get(p.registrationKey)
      if (existing?.handle.isActive && existing.target === p.resolvedTarget) {
        existing.handle.callback = p.def.callback
        const { target: _target, ...optionsWithoutTarget } = p.sequenceOpts
        existing.handle.setOptions({
          ...optionsWithoutTarget,
          enabled: p.enabled,
        })
        continue
      }

      if (existing) {
        if (existing.handle.isActive) {
          existing.handle.unregister()
        }
        registrations.delete(p.registrationKey)
      }

      const handle = manager.register(p.resolvedSequence, p.def.callback, {
        ...p.sequenceOpts,
        enabled: p.enabled,
        target: p.resolvedTarget,
      })
      registrations.set(p.registrationKey, {
        handle,
        target: p.resolvedTarget,
      })
    }
  })
}
