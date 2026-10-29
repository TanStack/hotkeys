import { createHotkeys, createHotkeysAttachment } from './createHotkeys.svelte.js'
import type { Attachment } from 'svelte/attachments'
import type {
  AppHotkey,
  HotkeyCallback,
  HotkeyCallbackContextFor,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type {
  AdapterAppHotkeyOptions,
  AdapterChordOptions,
  AdapterCommonOptions,
  AdapterHotkeyOptions,
  AdapterOptionsFor,
  AdapterSequenceOptions,
} from '@tanstack/hotkeys/adapter'
import type { MaybeGetter } from './internal.svelte.js'

/** The document or window to listen on. Use an attachment for elements. */
export type CreateHotkeyTarget = Document | Window

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

/**
 * Svelte function for registering a hotkey on the document: a chord such as
 * `'Mod+S'`, a sequence such as `['G', 'G']`, or an app hotkey from
 * `defineAppHotkeys`. Pass getters for reactive values. Use
 * `createHotkeyAttachment` for element-scoped hotkeys.
 *
 * Chords accept `requireReset`; sequences accept `timeout`. A one-step
 * sequence registers as its chord. An app hotkey uses its effective hotkey
 * from `HotkeysProvider` (including the user's custom hotkey) and its
 * declared meta and options, and registers nothing while unbound.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   createHotkey('Mod+S', () => save())
 *   createHotkey(['G', 'G'], () => scrollToTop(), { timeout: 500 })
 *   createHotkey('Escape', () => close(), () => ({ enabled: isOpen }))
 * </script>
 * ```
 */
export function createHotkey<T extends AppHotkey>(
  hotkey: MaybeGetter<T>,
  callback: HotkeyCallback,
  options?: MaybeGetter<CreateAppHotkeyOptions<T>>,
): void
export function createHotkey<const T extends RegisterableHotkey>(
  hotkey: MaybeGetter<T>,
  callback: HotkeyCallback<HotkeyCallbackContextFor<T>>,
  options?: MaybeGetter<CreateHotkeyOptionsFor<T>>,
): void
export function createHotkey(
  hotkey: MaybeGetter<RegisterableHotkey | AppHotkey>,
  callback: HotkeyCallback,
  options: MaybeGetter<CreateHotkeyCommonOptions> = {},
): void {
  createHotkeys([{ hotkey, callback, options } as never])
}

/**
 * Create an attachment for an element-scoped hotkey: a chord, a sequence, or
 * an app hotkey that listens on the attached element.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const saveKey = createHotkeyAttachment('Mod+S', () => save())
 * </script>
 *
 * <div tabindex="0" {@attach saveKey}>Editor content</div>
 * ```
 */
export function createHotkeyAttachment<T extends AppHotkey>(
  hotkey: MaybeGetter<T>,
  callback: HotkeyCallback,
  options?: MaybeGetter<CreateAppHotkeyOptions<T>>,
): Attachment<HTMLElement>
export function createHotkeyAttachment<const T extends RegisterableHotkey>(
  hotkey: MaybeGetter<T>,
  callback: HotkeyCallback<HotkeyCallbackContextFor<T>>,
  options?: MaybeGetter<CreateHotkeyOptionsFor<T>>,
): Attachment<HTMLElement>
export function createHotkeyAttachment(
  hotkey: MaybeGetter<RegisterableHotkey | AppHotkey>,
  callback: HotkeyCallback,
  options: MaybeGetter<CreateHotkeyCommonOptions> = {},
): Attachment<HTMLElement> {
  return createHotkeysAttachment([{ hotkey, callback, options } as never])
}
