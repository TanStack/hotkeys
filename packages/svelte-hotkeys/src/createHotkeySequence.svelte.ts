import { formatHotkeySequence, getSequenceManager } from '@tanstack/hotkeys'
import { onDestroy } from 'svelte'
import { getDefaultHotkeysOptions } from './HotkeysCtx'
import { resolveMaybeGetter } from './internal.svelte'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceOptions,
  SequenceRegistrationHandle,
} from '@tanstack/hotkeys'
import type { MaybeGetter } from './internal.svelte'
import type { Attachment } from 'svelte/attachments'

export interface CreateHotkeySequenceOptions extends Omit<
  SequenceOptions,
  'target'
> {
  target?: Document | Window // not html elements, use attachment instead
}

function registerHotkeySequence(
  target: HTMLElement | Document | Window,
  sequence: HotkeySequence,
  callback: HotkeyCallback,
  mergedOptions: CreateHotkeySequenceOptions,
) {
  return getSequenceManager().register(sequence, callback, {
    ...mergedOptions,
    target,
  })
}

/**
 * Register a global keyboard shortcut sequence for the current component.
 *
 * Each step may include modifiers. You can chain the same modifier across
 * steps (e.g. `Shift+R` then `Shift+T`). Modifier-only keydown events (Shift,
 * Control, Alt, or Meta pressed alone) are ignored while matching—they do not
 * advance the sequence or reset progress.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createHotkeySequence } from '@tanstack/svelte-hotkeys'
 *
 *   // Scroll to top when 'G G' is pressed
 *   createHotkeySequence(['G', 'G'], () => {
 *     scrollToTop()
 *   })
 *
 *   // Delete line when 'D D' is pressed
 *   createHotkeySequence(['D', 'D'], () => {
 *     deleteLine()
 *   })
 *
 *   // Delete inner word when 'D I W' is pressed
 *   createHotkeySequence(['D', 'I', 'W'], () => {
 *     deleteInnerWord()
 *   }, { timeout: 500 })
 *
 *   // Same modifier on consecutive steps (bare Shift between chords is ignored)
 *   createHotkeySequence(['Shift+R', 'Shift+T'], () => {
 *     nextAction()
 *   })
 * </script>
 *
 * <div>
 *   ....
 * </div>
 * ```
 */
export function createHotkeySequence(
  sequence: MaybeGetter<HotkeySequence>,
  callback: HotkeyCallback,
  options: MaybeGetter<CreateHotkeySequenceOptions> = {},
): void {
  let registration: SequenceRegistrationHandle | null = null
  let lastSequenceKey: string | null = null

  $effect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const resolvedSequence = resolveMaybeGetter(sequence)
    const resolvedOptions = resolveMaybeGetter(options)
    const mergedOptions = {
      ...getDefaultHotkeysOptions().hotkeySequence,
      ...resolvedOptions,
    } as CreateHotkeySequenceOptions

    const { target: _t, ...optionsWithoutTarget } = mergedOptions

    if (resolvedSequence.length === 0) {
      if (registration?.isActive) {
        registration.unregister()
        registration = null
      }
      lastSequenceKey = null
      return
    }

    const sequenceKey = formatHotkeySequence(resolvedSequence)

    if (registration?.isActive && lastSequenceKey === sequenceKey) {
      registration.callback = callback
      registration.setOptions(optionsWithoutTarget)
      return
    }

    if (registration?.isActive) {
      registration.unregister()
      registration = null
    }

    registration = registerHotkeySequence(
      document,
      resolvedSequence,
      callback,
      mergedOptions,
    )
    lastSequenceKey = sequenceKey
  })

  onDestroy(() => {
    if (registration?.isActive) {
      registration.unregister()
      registration = null
    }
  })
}

/**
 * Create an attachment for element-scoped keyboard sequences.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createHotkeySequenceAttachment } from '@tanstack/svelte-hotkeys'
 *
 *   const vimKeys = createHotkeySequenceAttachment(['G', 'G'], () => {
 *     scrollToTop()
 *   })
 * </script>
 *
 * <div tabindex="0" {@attach vimKeys}>
 *   Focus here and press g then g
 * </div>
 * ```
 */
export function createHotkeySequenceAttachment(
  sequence: MaybeGetter<HotkeySequence>,
  callback: HotkeyCallback,
  options: MaybeGetter<CreateHotkeySequenceOptions> = {},
): Attachment<HTMLElement> {
  return (element) => {
    let registration: SequenceRegistrationHandle | null = null
    let lastSequenceKey: string | null = null

    $effect(() => {
      const resolvedSequence = resolveMaybeGetter(sequence)
      const resolvedOptions = resolveMaybeGetter(options)
      const mergedOptions = {
        ...getDefaultHotkeysOptions().hotkeySequence,
        ...resolvedOptions,
      } as CreateHotkeySequenceOptions

      const { target: _t, ...optionsWithoutTarget } = mergedOptions

      if (resolvedSequence.length === 0) {
        if (registration?.isActive) {
          registration.unregister()
          registration = null
        }
        lastSequenceKey = null
        return
      }

      const sequenceKey = formatHotkeySequence(resolvedSequence)

      if (registration?.isActive && lastSequenceKey === sequenceKey) {
        registration.callback = callback
        registration.setOptions(optionsWithoutTarget)
        return
      }

      if (registration?.isActive) {
        registration.unregister()
        registration = null
      }

      registration = registerHotkeySequence(
        element,
        resolvedSequence,
        callback,
        mergedOptions,
      )
      lastSequenceKey = sequenceKey
    })

    return () => {
      if (registration?.isActive) {
        registration.unregister()
      }
    }
  }
}
