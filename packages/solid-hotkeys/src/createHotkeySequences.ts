import { createEffect, onCleanup } from 'solid-js'
import { formatHotkeySequence, getSequenceManager } from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import type { CreateHotkeySequenceOptions } from './createHotkeySequence'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceRegistrationHandle,
} from '@tanstack/hotkeys'

/**
 * A single sequence definition for use with `createHotkeySequences`.
 */
export interface CreateHotkeySequenceDefinition {
  /** Array of hotkey strings that form the sequence */
  sequence: HotkeySequence
  /** The function to call when the sequence is completed */
  callback: HotkeyCallback
  /** Per-sequence options (merged on top of commonOptions) */
  options?: CreateHotkeySequenceOptions
}

/**
 * SolidJS primitive for registering multiple keyboard shortcut sequences at once (Vim-style).
 *
 * Uses the singleton SequenceManager. Accepts a dynamic array of definitions, or accessors,
 * so you can react to variable-length lists.
 *
 * Options are merged in this order:
 * HotkeysProvider defaults < commonOptions < per-definition options
 *
 * Definitions with an empty `sequence` are skipped (no registration).
 *
 * @param sequences - Array of sequence definitions, or accessor returning them
 * @param commonOptions - Shared options for all sequences, or accessor
 *
 * @example
 * ```tsx
 * function VimPalette() {
 *   createHotkeySequences([
 *     { sequence: ['G', 'G'], callback: () => scrollToTop() },
 *     { sequence: ['D', 'D'], callback: () => deleteLine() },
 *   ])
 * }
 * ```
 *
 * @example
 * ```tsx
 * function Dynamic(props) {
 *   createHotkeySequences(
 *     () => props.items.map((item) => ({
 *       sequence: item.chords,
 *       callback: item.action,
 *       options: { enabled: item.enabled },
 *     })),
 *     { preventDefault: true },
 *   )
 * }
 * ```
 */
export function createHotkeySequences(
  sequences:
    | Array<CreateHotkeySequenceDefinition>
    | (() => Array<CreateHotkeySequenceDefinition>),
  commonOptions:
    | CreateHotkeySequenceOptions
    | (() => CreateHotkeySequenceOptions) = {},
): void {
  type RegistrationRecord = {
    handle: SequenceRegistrationHandle
    target: Document | HTMLElement | Window
  }

  const defaultOptions = useDefaultHotkeysOptions()
  const manager = getSequenceManager()

  const registrations = new Map<string, RegistrationRecord>()

  onCleanup(() => {
    for (const { handle } of registrations.values()) {
      if (handle.isActive) {
        handle.unregister()
      }
    }
    registrations.clear()
  })

  createEffect(() => {
    const resolved = typeof sequences === 'function' ? sequences() : sequences
    const resolvedCommonOptions =
      typeof commonOptions === 'function' ? commonOptions() : commonOptions

    const nextKeys = new Set<string>()
    const prepared: Array<{
      registrationKey: string
      def: CreateHotkeySequenceDefinition
      mergedOptions: CreateHotkeySequenceOptions
      sequenceString: string
      resolvedTarget: Document | HTMLElement | Window
    }> = []

    for (let i = 0; i < resolved.length; i++) {
      const def = resolved[i]!
      const resolvedDefOptions = def.options ?? {}

      const mergedOptions = {
        ...defaultOptions.hotkeySequence,
        ...resolvedCommonOptions,
        ...resolvedDefOptions,
      } as CreateHotkeySequenceOptions

      if (def.sequence.length === 0) {
        continue
      }

      const sequenceString = formatHotkeySequence(def.sequence)

      const resolvedTarget =
        'target' in mergedOptions
          ? (mergedOptions.target ?? null)
          : typeof document !== 'undefined'
            ? document
            : null

      if (!resolvedTarget) {
        continue
      }

      const registrationKey = `${i}:${sequenceString}`
      nextKeys.add(registrationKey)
      prepared.push({
        registrationKey,
        def,
        mergedOptions,
        sequenceString,
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
        const { target: _target, ...optionsWithoutTarget } = p.mergedOptions
        existing.handle.setOptions(optionsWithoutTarget)
        continue
      }

      if (existing) {
        if (existing.handle.isActive) {
          existing.handle.unregister()
        }
        registrations.delete(p.registrationKey)
      }

      const { target: _target, ...optionsWithoutTarget } = p.mergedOptions
      const handle = manager.register(p.def.sequence, p.def.callback, {
        ...optionsWithoutTarget,
        target: p.resolvedTarget,
      })
      registrations.set(p.registrationKey, {
        handle,
        target: p.resolvedTarget,
      })
    }
  })
}
