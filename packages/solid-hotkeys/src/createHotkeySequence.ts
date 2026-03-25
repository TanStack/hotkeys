import { createEffect, onCleanup } from 'solid-js'
import { formatHotkeySequence, getSequenceManager } from '@tanstack/hotkeys'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceOptions,
  SequenceRegistrationHandle,
} from '@tanstack/hotkeys'

export interface CreateHotkeySequenceOptions extends Omit<
  SequenceOptions,
  'target'
> {
  /**
   * The DOM element to attach the event listener to.
   * Can be a direct DOM element, an accessor, or null. Defaults to document.
   */
  target?: HTMLElement | Document | Window | null
}

/**
 * SolidJS primitive for registering a keyboard shortcut sequence (Vim-style).
 *
 * This primitive allows you to register multi-key sequences like 'g g' or 'd d'
 * that trigger when the full sequence is pressed within a timeout.
 *
 * Each step may include modifiers. You can chain the same modifier across
 * steps (e.g. `Shift+R` then `Shift+T`). Modifier-only keydown events (Shift,
 * Control, Alt, or Meta pressed alone) are ignored while matching—they do not
 * advance the sequence or reset progress.
 *
 * @param sequence - Array of hotkey strings that form the sequence (or accessor function)
 * @param callback - Function to call when the sequence is completed
 * @param options - Options for the sequence behavior (or accessor function)
 *
 * @example
 * ```tsx
 * function VimEditor() {
 *   // 'g g' to go to top
 *   createHotkeySequence(['G', 'G'], () => {
 *     scrollToTop()
 *   })
 *
 *   // 'd d' to delete line
 *   createHotkeySequence(['D', 'D'], () => {
 *     deleteLine()
 *   })
 *
 *   // 'd i w' to delete inner word
 *   createHotkeySequence(['D', 'I', 'W'], () => {
 *     deleteInnerWord()
 *   }, { timeout: 500 })
 *
 *   // Same modifier on consecutive steps (bare Shift between chords is ignored)
 *   createHotkeySequence(['Shift+R', 'Shift+T'], () => {
 *     nextAction()
 *   })
 *
 *   return <div>...</div>
 * }
 * ```
 */
export function createHotkeySequence(
  sequence: HotkeySequence | (() => HotkeySequence),
  callback: HotkeyCallback,
  options:
    | CreateHotkeySequenceOptions
    | (() => CreateHotkeySequenceOptions) = {},
): void {
  const defaultOptions = useDefaultHotkeysOptions()
  const manager = getSequenceManager()

  let registration: SequenceRegistrationHandle | null = null
  let lastSequenceKey: string | null = null
  let lastTarget: HTMLElement | Document | Window | null = null

  onCleanup(() => {
    if (registration?.isActive) {
      registration.unregister()
      registration = null
    }
    lastSequenceKey = null
    lastTarget = null
  })

  createEffect(() => {
    // Resolve reactive values
    const resolvedSequence =
      typeof sequence === 'function' ? sequence() : sequence
    const resolvedOptions = typeof options === 'function' ? options() : options

    const mergedOptions = {
      ...defaultOptions.hotkeySequence,
      ...resolvedOptions,
    } as CreateHotkeySequenceOptions

    // Extract options without target (target is handled separately)
    const { target: _target, ...optionsWithoutTarget } = mergedOptions

    // Resolve target: when explicitly provided (even as null), use it and skip if null.
    // When not provided, default to document. Matches createHotkey.
    const resolvedTarget =
      'target' in mergedOptions
        ? (mergedOptions.target ?? null)
        : typeof document !== 'undefined'
          ? document
          : null

    if (resolvedSequence.length === 0 || !resolvedTarget) {
      if (registration?.isActive) {
        registration.unregister()
        registration = null
      }
      lastSequenceKey = null
      lastTarget = null
      return
    }

    const sequenceKey = formatHotkeySequence(resolvedSequence)

    if (
      registration?.isActive &&
      lastSequenceKey === sequenceKey &&
      lastTarget === resolvedTarget
    ) {
      registration.callback = callback
      registration.setOptions(optionsWithoutTarget)
      return
    }

    if (registration?.isActive) {
      registration.unregister()
      registration = null
    }

    registration = manager.register(resolvedSequence, callback, {
      ...mergedOptions,
      target: resolvedTarget,
    })

    if (registration.isActive) {
      registration.callback = callback
      registration.setOptions(optionsWithoutTarget)
    }

    lastSequenceKey = sequenceKey
    lastTarget = resolvedTarget
  })
}
