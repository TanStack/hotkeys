import { createHotkeys } from './createHotkeys'
import type {
  AppHotkey,
  HotkeyCallback,
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
 * The element to listen on. A `null` target skips registration, so pass an
 * accessor such as `() => ({ target: element() })` for elements that attach
 * after mount.
 */
export type CreateHotkeyTarget = Target | null

/** Options shared by chords and sequences. */
export type CreateHotkeyOptions = AdapterHotkeyOptions<CreateHotkeyTarget>

/** Options for a chord such as `'Mod+S'`. */
export type CreateHotkeyChordOptions = AdapterChordOptions<CreateHotkeyTarget>

/** Options for a sequence such as `['G', 'G']`. */
export type CreateHotkeySequenceOptions =
  AdapterSequenceOptions<CreateHotkeyTarget>

/** Options applied to every hotkey, such as provider defaults. Each applies to the kinds that support it. */
export type CreateHotkeyCommonOptions = AdapterCommonOptions<CreateHotkeyTarget>

/** The options type for a hotkey: chord options for chords, sequence options for sequences. */
export type CreateHotkeyOptionsFor<T extends RegisterableHotkey> =
  AdapterOptionsFor<T, CreateHotkeyTarget>

/** Call-site options for an app hotkey, typed by its declared default kind. */
export type CreateAppHotkeyOptions<T extends AppHotkey = AppHotkey> =
  AdapterAppHotkeyOptions<T, CreateHotkeyTarget>

type MaybeAccessor<T> = T | (() => T)

/**
 * Solid primitive for registering a hotkey: a chord such as `'Mod+S'`, a
 * sequence such as `['G', 'G']`, or an app hotkey from `defineAppHotkeys`.
 * The hotkey and options may be accessors.
 *
 * Chords accept `requireReset`; sequences accept `timeout`. A one-step
 * sequence registers as its chord. An app hotkey uses its effective hotkey
 * from `HotkeysProvider` (including the user's custom hotkey) and its
 * declared meta and options, and registers nothing while unbound.
 *
 * @example
 * ```tsx
 * createHotkey('Mod+S', () => save())
 * createHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 })
 * createHotkey('Escape', () => close(), () => ({ enabled: isOpen() }))
 * ```
 */
export function createHotkey<T extends AppHotkey>(
  hotkey: MaybeAccessor<T>,
  callback: HotkeyCallback,
  options?: MaybeAccessor<CreateAppHotkeyOptions<T>>,
): void
export function createHotkey<T extends RegisterableHotkey>(
  hotkey: MaybeAccessor<T>,
  callback: HotkeyCallback,
  options?: MaybeAccessor<CreateHotkeyOptionsFor<T>>,
): void
export function createHotkey(
  hotkey: MaybeAccessor<RegisterableHotkey | AppHotkey>,
  callback: HotkeyCallback,
  options: MaybeAccessor<CreateHotkeyCommonOptions> = {},
): void {
  createHotkeys(
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
