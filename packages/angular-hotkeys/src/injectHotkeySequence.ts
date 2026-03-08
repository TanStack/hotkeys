import { effect } from '@angular/core'
import { getSequenceManager } from '@tanstack/hotkeys'
import { injectDefaultHotkeysOptions } from './hotkeys-provider'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceOptions,
} from '@tanstack/hotkeys'

export interface InjectHotkeySequenceOptions extends Omit<
  SequenceOptions,
  'enabled'
> {
  /** Whether the sequence is enabled. Defaults to true. */
  enabled?: boolean
}

/**
 * Angular inject-based API for registering a keyboard shortcut sequence (Vim-style).
 *
 * Allows you to register multi-key sequences like 'g g' or 'd d' that trigger
 * when the full sequence is pressed within a timeout.
 *
 * @param sequence - Array of hotkey strings that form the sequence (or getter function)
 * @param callback - Function to call when the sequence is completed
 * @param options - Options for the sequence behavior (or getter function)
 *
 * @example
 * ```ts
 * @Component({ ... })
 * export class VimEditorComponent {
 *   lastSequence = signal<string | null>(null)
 *
 *   constructor() {
 *     injectHotkeySequence(['G', 'G'], () => this.lastSequence.set('gg → Go to top'))
 *     injectHotkeySequence(['D', 'D'], () => this.lastSequence.set('dd → Delete line'))
 *     injectHotkeySequence(['C', 'I', 'W'], () => this.lastSequence.set('ciw'), { timeout: 500 })
 *   }
 * }
 * ```
 */
export function injectHotkeySequence(
  sequence: HotkeySequence | (() => HotkeySequence),
  callback: HotkeyCallback,
  options:
    | InjectHotkeySequenceOptions
    | (() => InjectHotkeySequenceOptions) = {},
): void {
  const defaultOptions = injectDefaultHotkeysOptions()

  effect((onCleanup) => {
    // Resolve reactive values
    const resolvedSequence =
      typeof sequence === 'function' ? sequence() : sequence
    const resolvedOptions = typeof options === 'function' ? options() : options

    const mergedOptions = {
      ...defaultOptions.hotkeySequence,
      ...resolvedOptions,
    } as InjectHotkeySequenceOptions

    const { enabled = true, ...sequenceOptions } = mergedOptions

    if (!enabled || resolvedSequence.length === 0) {
      return
    }

    const manager = getSequenceManager()

    // Pass through options; default target to document when not provided
    const registerOptions: SequenceOptions = {
      ...sequenceOptions,
      enabled: true,
      target:
        sequenceOptions.target ??
        (typeof document !== 'undefined' ? document : undefined),
    }

    const handle = manager.register(resolvedSequence, callback, registerOptions)

    onCleanup(() => {
      if (handle.isActive) {
        handle.unregister()
      }
    })
  })
}
