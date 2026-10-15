import { useHotkeys } from './useHotkeys'
import type { MaybeRefOrGetter } from 'vue'
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
 * The element to listen on: a ref, getter, element, or null. A target that
 * resolves to `null` skips registration until it is set. Defaults to document.
 */
export type UseHotkeyTarget = MaybeRefOrGetter<Target | null>

/** Lets `enabled` be a ref or getter. */
type WithReactiveEnabled<TOptions> = Omit<TOptions, 'enabled'> & {
  /** Whether the hotkey is active. Can be a ref, getter, or boolean. Defaults to true. */
  enabled?: MaybeRefOrGetter<boolean>
}

/** Options shared by chords and sequences. */
export type UseHotkeyOptions = WithReactiveEnabled<
  AdapterHotkeyOptions<UseHotkeyTarget>
>

/** Options for a chord such as `'Mod+S'`. */
export type UseHotkeyChordOptions = WithReactiveEnabled<
  AdapterChordOptions<UseHotkeyTarget>
>

/** Options for a sequence such as `['G', 'G']`. */
export type UseHotkeySequenceOptions = WithReactiveEnabled<
  AdapterSequenceOptions<UseHotkeyTarget>
>

/** Options applied to every hotkey, such as provider defaults. Each applies to the kinds that support it. */
export type UseHotkeyCommonOptions = WithReactiveEnabled<
  AdapterCommonOptions<UseHotkeyTarget>
>

/** The options type for a hotkey: chord options for chords, sequence options for sequences. */
export type UseHotkeyOptionsFor<T extends RegisterableHotkey> =
  WithReactiveEnabled<AdapterOptionsFor<T, UseHotkeyTarget>>

/** Call-site options for an app hotkey, typed by its declared default kind. */
export type UseAppHotkeyOptions<T extends AppHotkey = AppHotkey> =
  WithReactiveEnabled<AdapterAppHotkeyOptions<T, UseHotkeyTarget>>

/**
 * Vue composable for registering a hotkey: a chord such as `'Mod+S'`, a
 * sequence such as `['G', 'G']`, or an app hotkey from `defineAppHotkeys`.
 * The hotkey and options may be refs or getters.
 *
 * Chords accept `requireReset`; sequences accept `timeout`. A one-step
 * sequence registers as its chord. An app hotkey uses its effective hotkey
 * from `HotkeysProvider` (including the user's custom hotkey) and its
 * declared meta and options, and registers nothing while unbound.
 *
 * @example
 * ```ts
 * useHotkey('Mod+S', () => save())
 * useHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 })
 * useHotkey('Escape', () => close(), { enabled: isOpen })
 * ```
 */
export function useHotkey<T extends AppHotkey>(
  hotkey: MaybeRefOrGetter<T>,
  callback: HotkeyCallback,
  options?: MaybeRefOrGetter<UseAppHotkeyOptions<T>>,
): void
export function useHotkey<T extends RegisterableHotkey>(
  hotkey: MaybeRefOrGetter<T>,
  callback: HotkeyCallback,
  options?: MaybeRefOrGetter<UseHotkeyOptionsFor<T>>,
): void
export function useHotkey(
  hotkey: MaybeRefOrGetter<RegisterableHotkey | AppHotkey>,
  callback: HotkeyCallback,
  options: MaybeRefOrGetter<UseHotkeyCommonOptions> = {},
): void {
  useHotkeys([{ hotkey, callback, options } as never])
}
