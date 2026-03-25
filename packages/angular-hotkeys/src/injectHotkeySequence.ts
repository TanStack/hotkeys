import { DestroyRef, effect, inject } from '@angular/core'
import { formatHotkeySequence, getSequenceManager } from '@tanstack/hotkeys'
import { injectDefaultHotkeysOptions } from './hotkeys-provider'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceOptions,
  SequenceRegistrationHandle,
} from '@tanstack/hotkeys'

type SequenceTarget = Document | HTMLElement | Window

export interface InjectHotkeySequenceOptions extends Omit<
  SequenceOptions,
  'enabled' | 'target'
> {
  /** Whether the sequence is enabled. Defaults to true. */
  enabled?: boolean
  /**
   * The DOM element to attach the event listener to.
   * Can be a direct DOM element, an accessor target, or null.
   * Defaults to document when omitted.
   */
  target?: HTMLElement | Document | Window | null
}

/**
 * Angular inject-based API for registering a keyboard shortcut sequence (Vim-style).
 *
 * Allows you to register multi-key sequences like 'g g' or 'd d' that trigger
 * when the full sequence is pressed within a timeout.
 *
 * Each step may include modifiers. You can chain the same modifier across
 * steps (e.g. `Shift+R` then `Shift+T`). Modifier-only keydown events (Shift,
 * Control, Alt, or Meta pressed alone) are ignored while matching—they do not
 * advance the sequence or reset progress.
 *
 * @param sequence - Array of hotkey strings that form the sequence (or getter function)
 * @param callback - Function to call when the sequence is completed
 * @param options - Options for the sequence behavior (or getter function). `enabled: false` still registers
 *   the sequence (visible in devtools); only execution is suppressed.
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
 *     injectHotkeySequence(['Shift+R', 'Shift+T'], () => this.lastSequence.set('⇧R⇧T'))
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
  const manager = getSequenceManager()
  const destroyRef = inject(DestroyRef)

  let handle: SequenceRegistrationHandle | null = null
  let lastSequenceKey: string | null = null
  let lastTarget: SequenceTarget | null = null

  destroyRef.onDestroy(() => {
    if (handle?.isActive) {
      handle.unregister()
      handle = null
    }
    lastSequenceKey = null
    lastTarget = null
  })

  effect(() => {
    // Resolve reactive values
    const resolvedSequence =
      typeof sequence === 'function' ? sequence() : sequence
    const resolvedOptions = typeof options === 'function' ? options() : options

    const mergedOptions = {
      ...defaultOptions.hotkeySequence,
      ...resolvedOptions,
    } as InjectHotkeySequenceOptions

    const { enabled = true, ...sequenceOptions } = mergedOptions

    const resolvedTarget =
      'target' in sequenceOptions
        ? (sequenceOptions.target ?? null)
        : typeof document !== 'undefined'
          ? document
          : null

    if (resolvedSequence.length === 0 || !resolvedTarget) {
      if (handle?.isActive) {
        handle.unregister()
        handle = null
      }
      lastSequenceKey = null
      lastTarget = null
      return
    }

    const sequenceKey = formatHotkeySequence(resolvedSequence)

    const registerPayload: SequenceOptions = {
      ...sequenceOptions,
      enabled,
      target: resolvedTarget,
    }
    const { target: _t, ...optionsWithoutTarget } = registerPayload

    if (
      handle?.isActive &&
      lastSequenceKey === sequenceKey &&
      lastTarget === resolvedTarget
    ) {
      handle.callback = callback
      handle.setOptions(optionsWithoutTarget)
      return
    }

    if (handle?.isActive) {
      handle.unregister()
      handle = null
    }

    handle = manager.register(resolvedSequence, callback, registerPayload)
    lastSequenceKey = sequenceKey
    lastTarget = resolvedTarget
  })
}
