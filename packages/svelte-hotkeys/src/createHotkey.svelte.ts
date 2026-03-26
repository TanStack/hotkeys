import {
  detectPlatform,
  getHotkeyManager,
  normalizeRegisterableHotkey,
} from '@tanstack/hotkeys'
import { onDestroy } from 'svelte'
import { getDefaultHotkeysOptions } from './HotkeysCtx'
import { resolveMaybeGetter } from './internal.svelte'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyOptions,
  HotkeyRegistrationHandle,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { MaybeGetter } from './internal.svelte'
import type { Attachment } from 'svelte/attachments'

export interface CreateHotkeyOptions extends Omit<HotkeyOptions, 'target'> {
  target?: Document | Window // not html elements, use attachment instead
}

function registerHotkey(
  target: HTMLElement | Document | Window,
  hotkey: RegisterableHotkey,
  callback: HotkeyCallback,
  mergedOptions: CreateHotkeyOptions,
) {
  return getHotkeyManager().register(
    normalizeRegisterableHotkey(
      hotkey,
      mergedOptions.platform ?? detectPlatform(),
    ),
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
  let registration: HotkeyRegistrationHandle | null = null
  let lastHotkeyStr: Hotkey | null = null

  $effect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const resolvedHotkey = resolveMaybeGetter(hotkey)
    const resolvedOptions = resolveMaybeGetter(options)
    const mergedOptions = {
      ...getDefaultHotkeysOptions().hotkey,
      ...resolvedOptions,
    } as CreateHotkeyOptions

    const hotkeyStr = normalizeRegisterableHotkey(
      resolvedHotkey,
      mergedOptions.platform ?? detectPlatform(),
    )
    const { target: _t, ...optionsWithoutTarget } = mergedOptions

    if (registration?.isActive && lastHotkeyStr === hotkeyStr) {
      registration.callback = callback
      registration.setOptions(optionsWithoutTarget)
      return
    }

    if (registration?.isActive) {
      registration.unregister()
      registration = null
    }

    registration = registerHotkey(
      document,
      resolvedHotkey,
      callback,
      mergedOptions,
    )
    lastHotkeyStr = hotkeyStr
  })

  onDestroy(() => {
    if (registration?.isActive) {
      registration.unregister()
      registration = null
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
    let registration: HotkeyRegistrationHandle | null = null
    let lastHotkeyStr: Hotkey | null = null

    $effect(() => {
      const resolvedHotkey = resolveMaybeGetter(hotkey)
      const resolvedOptions = resolveMaybeGetter(options)
      const mergedOptions = {
        ...getDefaultHotkeysOptions().hotkey,
        ...resolvedOptions,
      } as CreateHotkeyOptions

      const hotkeyStr = normalizeRegisterableHotkey(
        resolvedHotkey,
        mergedOptions.platform ?? detectPlatform(),
      )
      const { target: _t, ...optionsWithoutTarget } = mergedOptions

      if (registration?.isActive && lastHotkeyStr === hotkeyStr) {
        registration.callback = callback
        registration.setOptions(optionsWithoutTarget)
        return
      }

      if (registration?.isActive) {
        registration.unregister()
        registration = null
      }

      registration = registerHotkey(
        element,
        resolvedHotkey,
        callback,
        mergedOptions,
      )
      lastHotkeyStr = hotkeyStr
    })

    return () => {
      if (registration?.isActive) {
        registration.unregister()
      }
    }
  }
}
