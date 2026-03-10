import {
  detectPlatform,
  formatHotkey,
  getHotkeyManager,
  rawHotkeyToParsedHotkey,
} from '@tanstack/hotkeys'
import { getDefaultHotkeysOptions } from './HotkeysCtx'
import { resolveMaybeGetter } from './internal.svelte'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { MaybeGetter } from './internal.svelte'
import type { Attachment } from 'svelte/attachments'

export interface CreateHotkeyOptions extends Omit<HotkeyOptions, 'target'> {
  target?: Document | Window // not html elements, use attachment instead
}

function normalizeHotkey(
  hotkey: RegisterableHotkey,
  options: CreateHotkeyOptions,
): Hotkey {
  const platform = options.platform ?? detectPlatform()

  return typeof hotkey === 'string'
    ? hotkey
    : (formatHotkey(rawHotkeyToParsedHotkey(hotkey, platform)) as Hotkey)
}

function registerHotkey(
  target: HTMLElement | Document | Window,
  hotkey: MaybeGetter<RegisterableHotkey>,
  callback: HotkeyCallback,
  options: MaybeGetter<CreateHotkeyOptions>,
) {
  const resolvedHotkey = resolveMaybeGetter(hotkey)
  const resolvedOptions = resolveMaybeGetter(options)
  const mergedOptions = {
    ...getDefaultHotkeysOptions().hotkey,
    ...resolvedOptions,
  } as CreateHotkeyOptions

  return getHotkeyManager().register(
    normalizeHotkey(resolvedHotkey, mergedOptions),
    callback,
    {
      ...mergedOptions,
      target,
    },
  )
}

/**
 * Register a global hotkey for the current component.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createHotkey } from '@tanstack/svelte-hotkeys'
 *
 *   createHotkey('Mod+S', () => {
 *     console.log('Mod+S pressed')
 *   })
 * </script>
 * ```
 */
export function createHotkey(
  hotkey: MaybeGetter<RegisterableHotkey>,
  callback: HotkeyCallback,
  options: MaybeGetter<CreateHotkeyOptions> = {},
): void {
  $effect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const registration = registerHotkey(document, hotkey, callback, options)

    return () => {
      registration.unregister()
    }
  })
}

/**
 * Create an attachment for element-scoped hotkeys.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createHotkeyAttachment } from '@tanstack/svelte-hotkeys'
 *
 *   let count = $state(0)
 *   const saveHotkey = createHotkeyAttachment('Mod+S', () => {
 *     count++
 *   })
 *
 * </script>
 *
 * <div tabindex="0" {@attach saveHotkey}>
 *   Count: {count}
 * </div>
 * ```
 */
export function createHotkeyAttachment(
  hotkey: MaybeGetter<RegisterableHotkey>,
  callback: HotkeyCallback,
  options: MaybeGetter<CreateHotkeyOptions> = {},
): Attachment<HTMLElement> {
  return (element) => {
    const registration = registerHotkey(element, hotkey, callback, options)

    return () => {
      registration.unregister()
    }
  }
}
