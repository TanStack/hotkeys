import { injectHotkeys } from './injectHotkeys'
import type { ElementRef, Signal } from '@angular/core'
import type {
  AppHotkey,
  HotkeyCallback,
  HotkeyCallbackContextFor,
  RegisterableHotkey,
  Target,
} from '@tanstack/hotkeys'
import type {
  AdapterAppHotkeyOptions,
  AdapterChordOptions,
  AdapterCommonOptions,
  AdapterHotkeyOptions,
  AdapterOptionsFor,
  AdapterSequenceOptions,
} from '@tanstack/hotkeys/adapter'

/**
 * The element to listen on: an element, an `ElementRef`, or a signal of
 * either, such as `viewChild<ElementRef>('panel')`. A `null` target, or a
 * signal of `undefined`, skips registration until the element exists.
 */
export type InjectHotkeyTarget =
  | Target
  | ElementRef<Target>
  | Signal<Target | ElementRef<Target> | null | undefined>
  | null

/** Options shared by chords and sequences. */
export type InjectHotkeyOptions = AdapterHotkeyOptions<InjectHotkeyTarget>

/** Options for a chord such as `'Mod+S'`. */
export type InjectHotkeyChordOptions = AdapterChordOptions<InjectHotkeyTarget>

/** Options for a sequence such as `['G', 'G']`. */
export type InjectHotkeySequenceOptions =
  AdapterSequenceOptions<InjectHotkeyTarget>

/** Options applied to every hotkey, such as provider defaults. Each applies to the kinds that support it. */
export type InjectHotkeyCommonOptions = AdapterCommonOptions<InjectHotkeyTarget>

/** The options type for a hotkey: chord options for chords, sequence options for sequences. */
export type InjectHotkeyOptionsFor<T extends RegisterableHotkey> =
  AdapterOptionsFor<T, InjectHotkeyTarget>

/** Call-site options for an app hotkey, typed by its declared default kind. */
export type InjectAppHotkeyOptions<T extends AppHotkey = AppHotkey> =
  AdapterAppHotkeyOptions<T, InjectHotkeyTarget>

type MaybeGetter<T> = T | (() => T)

/**
 * Angular inject-based API for registering a hotkey: a chord such as
 * `'Mod+S'`, a sequence such as `['G', 'G']`, or an app hotkey from
 * `defineAppHotkeys`. The hotkey and options may be getters that read signals.
 *
 * Chords accept `requireReset`; sequences accept `timeout`. A one-step
 * sequence registers as its chord. An app hotkey uses its effective hotkey
 * from `provideHotkeys` (including the user's custom hotkey) and its declared
 * meta and options, and registers nothing while unbound. A hotkey of
 * `undefined`, `null`, or `''` registers nothing, for an optional shortcut
 * such as `() => this.shortcut()`; when it changes to a hotkey, it registers.
 *
 * @example
 * ```ts
 * @Component({ ... })
 * export class EditorComponent {
 *   constructor() {
 *     injectHotkey('Mod+S', () => this.save())
 *     injectHotkey(['G', 'G'], () => this.scrollToTop(), { timeout: 500 })
 *     injectHotkey('Escape', () => this.close(), () => ({ enabled: this.isOpen() }))
 *   }
 * }
 * ```
 */
export function injectHotkey<T extends AppHotkey>(
  hotkey: MaybeGetter<T | null | undefined>,
  callback: HotkeyCallback,
  options?: MaybeGetter<InjectAppHotkeyOptions<T>>,
): void
export function injectHotkey<const T extends RegisterableHotkey>(
  hotkey: MaybeGetter<T | null | undefined>,
  callback: HotkeyCallback<HotkeyCallbackContextFor<T>>,
  options?: MaybeGetter<InjectHotkeyOptionsFor<T>>,
): void
export function injectHotkey(
  hotkey: MaybeGetter<RegisterableHotkey | AppHotkey | null | undefined>,
  callback: HotkeyCallback,
  options: MaybeGetter<InjectHotkeyCommonOptions> = {},
): void {
  injectHotkeys(
    () =>
      [
        {
          hotkey: typeof hotkey === 'function' ? hotkey() : hotkey,
          callback,
          options: typeof options === 'function' ? options() : options,
        },
      ] as never,
  )
}
