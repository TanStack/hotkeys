import { getSequenceManager } from '@tanstack/hotkeys'
import { getDefaultHotkeysOptions } from './HotkeysCtx'
import { resolveMaybeGetter } from './internal.svelte'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceOptions,
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
  sequence: MaybeGetter<HotkeySequence>,
  callback: HotkeyCallback,
  options: MaybeGetter<CreateHotkeySequenceOptions>,
) {
  const resolvedSequence = resolveMaybeGetter(sequence)
  const resolvedOptions = resolveMaybeGetter(options)
  const mergedOptions = {
    ...getDefaultHotkeysOptions().hotkeySequence,
    ...resolvedOptions,
  } as CreateHotkeySequenceOptions

  return getSequenceManager().register(resolvedSequence, callback, {
    ...mergedOptions,
    target,
  })
}

/**
 * Register a global keyboard shortcut sequence for the current component.
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
  $effect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const resolvedSequence = resolveMaybeGetter(sequence)
    if (resolvedSequence.length === 0) {
      return
    }

    const registration = registerHotkeySequence(
      document,
      resolvedSequence,
      callback,
      options,
    )

    return () => {
      registration.unregister()
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
    const resolvedSequence = resolveMaybeGetter(sequence)

    if (resolvedSequence.length === 0) {
      return
    }

    const registration = registerHotkeySequence(
      element,
      resolvedSequence,
      callback,
      options,
    )

    return () => {
      registration.unregister()
    }
  }
}
