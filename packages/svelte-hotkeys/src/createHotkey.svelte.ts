import {
  detectPlatform,
  formatHotkey,
  getHotkeyManager,
  rawHotkeyToParsedHotkey,
} from '@tanstack/hotkeys'
import { getDefaultHotkeysOptions } from './HotkeysCtx'
import type { ResolvedTarget, Target } from './HotkeysCtx'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyOptions,
  HotkeyRegistrationHandle,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

export interface CreateHotkeyOptions extends Omit<HotkeyOptions, 'target'> {
  /**
   * The DOM element to attach the event listener to.
   * Can be a Svelte ref, direct DOM element, or null.
   * Defaults to document.
   */
  target?: Target
}

function resolveTarget(target: Target): ResolvedTarget {
  if (typeof target === 'function') {
    return target() ?? null
  }

  return target
}

/**
 * Svelte function for registering a keyboard hotkey.
 *
 * Uses the singleton HotkeyManager for efficient event handling.
 * The callback receives both the keyboard event and a context object
 * containing the hotkey string and parsed hotkey.
 *
 * This function syncs the callback and options on every render to avoid
 * stale closures. This means
 * callbacks that reference Svelte state will always have access to
 * the latest values.
 *
 * @example
 * ```svelte
 *
 * <script lang="ts">
 *   import { createHotkey } from '@tanstack/svelte-hotkeys'
 *
 *   let ref = $state<HTMLButtonElement | null>(null)
 *
 *   createHotkey('Mod+S', () => {
 *     console.log('Mod+S pressed')
 *   }, { target: ref })
 * </script>
 *
 * <div bind:this={ref}>
 *   ....
 * </div>
 * ```
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createHotkey } from '@tanstack/svelte-hotkeys'
 *
 *   let ref = $state<HTMLDivElement | null>(null)
 *   let count = $state(0)
 *
 *   createHotkey('Mod+S', () => {
 *     console.log('Mod+S pressed')
 *     count++
 *   }, { target: ref })
 * </script>
 *
 * <div bind:this={ref}>
 *   Count: {count}
 * </div>
 * ```
 */

export function createHotkey(
  hotkey: RegisterableHotkey,
  callback: HotkeyCallback,
  options: CreateHotkeyOptions = {},
): void {
  const mergedOptions = {
    ...getDefaultHotkeysOptions().hotkey,
    ...options,
  } as CreateHotkeyOptions

  const manager = getHotkeyManager()

  // Stable ref for registration handle
  let registrationRef: HotkeyRegistrationHandle | null = null

  // Refs to capture current values for use in effect without adding dependencies
  let callbackRef = callback
  let optionsRef = mergedOptions
  let managerRef = manager

  $effect(() => {
    callbackRef = callback
    optionsRef = mergedOptions
    managerRef = manager
  })

  // Track previous target and hotkey to detect changes requiring re-registration
  let prevTargetRef: ResolvedTarget = null
  let prevHotkeyRef: string | null = null

  // Normalize to hotkey string
  const platform = mergedOptions.platform ?? detectPlatform()
  const hotkeyString: Hotkey =
    typeof hotkey === 'string'
      ? hotkey
      : (formatHotkey(rawHotkeyToParsedHotkey(hotkey, platform)) as Hotkey)

  // Extract options without target (target is handled separately)
  const { target: _target, ...optionsWithoutTarget } = mergedOptions

  $effect(() => {
    // Resolve target inside the effect so refs are already attached after mount
    const resolvedTarget = optionsRef.target
      ? resolveTarget(optionsRef.target)
      : typeof document !== 'undefined'
        ? document
        : null

    // Skip if no valid target (SSR or ref still null)
    if (!resolvedTarget) {
      return
    }

    // Check if we need to re-register (target or hotkey changed)
    const targetChanged =
      prevTargetRef !== null && prevTargetRef !== resolvedTarget
    const hotkeyChanged =
      prevHotkeyRef !== null && prevHotkeyRef !== hotkeyString

    // If we have an active registration and target/hotkey changed, unregister first
    if (registrationRef?.isActive && (targetChanged || hotkeyChanged)) {
      registrationRef.unregister()
      registrationRef = null
    }

    // Register if needed (no active registration)
    // Use refs to access current values without adding them to dependencies
    if (!registrationRef || !registrationRef.isActive) {
      registrationRef = managerRef.register(hotkeyString, callbackRef, {
        ...optionsRef,
        target: resolvedTarget,
      })
    }

    // Update tracking refs
    prevTargetRef = resolvedTarget
    prevHotkeyRef = hotkeyString

    // Cleanup on unmount
    return () => {
      if (registrationRef?.isActive) {
        registrationRef.unregister()
        registrationRef = null
      }
    }
  })

  // Sync callback and options on EVERY render (outside useEffect)
  // This avoids stale closures - the callback always has access to latest state
  $effect(() => {
    if (registrationRef?.isActive) {
      registrationRef.callback = callbackRef
      registrationRef.setOptions(optionsWithoutTarget)
    }
  })
}
