import { DestroyRef, effect, inject } from '@angular/core'
import {
  detectPlatform,
  getHotkeyManager,
  normalizeRegisterableHotkey,
} from '@tanstack/hotkeys'
import { injectDefaultHotkeysOptions } from './hotkeys-provider'
import type {
  Hotkey,
  HotkeyCallback,
  HotkeyOptions,
  HotkeyRegistrationHandle,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

export interface InjectHotkeyOptions extends Omit<HotkeyOptions, 'target'> {
  /**
   * The DOM element to attach the event listener to.
   * Can be a direct DOM element, an accessor (for reactive targets that become
   * available after mount), or null. Defaults to document.
   * When using scoped targets, pass an accessor: () => ({ target: elementSignal() })
   * so the hotkey waits for the element to be attached before registering.
   */
  target?: HTMLElement | Document | Window | null
}

/**
 * Angular inject-based API for registering a keyboard hotkey.
 *
 * Uses the singleton HotkeyManager for efficient event handling.
 * The callback receives both the keyboard event and a context object
 * containing the hotkey string and parsed hotkey.
 *
 * Call in an injection context (e.g. constructor or field initializer).
 * Uses effect() to track reactive dependencies and update registration
 * when options or the callback change.
 * `enabled: false` keeps the registration (visible in devtools) and only suppresses firing; the same
 * handle is updated instead of unregistering and re-registering when identity is unchanged.
 *
 * @param hotkey - The hotkey string (e.g. 'Mod+S', 'Escape') or getter function
 * @param callback - The function to call when the hotkey is pressed
 * @param options - Options for the hotkey behavior, or getter for reactive options
 *
 * @example
 * ```ts
 * @Component({ ... })
 * export class SaveButtonComponent {
 *   private readonly saveCount = signal(0)
 *
 *   constructor() {
 *     injectHotkey('Mod+S', (event, { hotkey }) => {
 *       event.preventDefault()
 *       this.saveCount.update(c => c + 1)
 *     })
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * @Component({ ... })
 * export class ModalComponent {
 *   isOpen = signal(true)
 *
 *   constructor() {
 *     injectHotkey('Escape', () => this.close(), () => ({ enabled: this.isOpen() }))
 *   }
 * }
 * ```
 *
 * @example
 * ```ts
 * @Component({ ... })
 * export class EditorComponent {
 *   private readonly editorRef = viewChild<ElementRef<HTMLDivElement>>('editorRef')
 *
 *   constructor() {
 *     injectHotkey('Mod+B', () => this.toggleBold(), () => ({
 *       target: this.editorRef()?.nativeElement ?? null,
 *     }))
 *   }
 * }
 * ```
 */
export function injectHotkey(
  hotkey: RegisterableHotkey | (() => RegisterableHotkey),
  callback: HotkeyCallback,
  options: InjectHotkeyOptions | (() => InjectHotkeyOptions) = {},
): void {
  const defaultOptions = injectDefaultHotkeysOptions()
  const manager = getHotkeyManager()
  const destroyRef = inject(DestroyRef)

  let registration: HotkeyRegistrationHandle | null = null
  let lastHotkeyString: Hotkey | null = null
  let lastTarget: HTMLElement | Document | Window | null = null

  destroyRef.onDestroy(() => {
    if (registration?.isActive) {
      registration.unregister()
      registration = null
    }
    lastHotkeyString = null
    lastTarget = null
  })

  effect(() => {
    // Resolve reactive values
    const resolvedHotkey = typeof hotkey === 'function' ? hotkey() : hotkey
    const resolvedOptions = typeof options === 'function' ? options() : options

    const mergedOptions = {
      ...defaultOptions.hotkey,
      ...resolvedOptions,
    } as InjectHotkeyOptions

    // Normalize to hotkey string
    const platform = mergedOptions.platform ?? detectPlatform()
    const hotkeyString = normalizeRegisterableHotkey(resolvedHotkey, platform)

    // Resolve target: when explicitly provided (even as null), use it and skip if null.
    // When not provided, default to document. Matches React's ref handling.
    const resolvedTarget =
      'target' in mergedOptions
        ? (mergedOptions.target ?? null)
        : typeof document !== 'undefined'
          ? document
          : null

    if (!resolvedTarget) {
      if (registration?.isActive) {
        registration.unregister()
        registration = null
      }
      lastHotkeyString = null
      lastTarget = null
      return
    }

    // Extract options without target (target is handled separately)
    const { target: _target, ...optionsWithoutTarget } = mergedOptions

    if (
      registration?.isActive &&
      lastHotkeyString === hotkeyString &&
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

    registration = manager.register(hotkeyString, callback, {
      ...optionsWithoutTarget,
      target: resolvedTarget,
    })

    if (registration.isActive) {
      registration.callback = callback
      registration.setOptions(optionsWithoutTarget)
    }

    lastHotkeyString = hotkeyString
    lastTarget = resolvedTarget
  })
}
