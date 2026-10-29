import {
  createHotkeyBindings,
  prepareHotkeyDefinitions,
} from '@tanstack/hotkeys/adapter'
import { onDestroy } from 'svelte'
import { getHotkeysContext } from './HotkeysCtx.js'
import {
  createAppHotkeysSubscriber,
  resolveMaybeGetter,
} from './internal.svelte.js'
import type { Attachment } from 'svelte/attachments'
import type {
  AppHotkey,
  HotkeyCallback,
  RegisterableHotkey,
  RegisterableHotkeyChord,
  RegisterableHotkeySequence,
} from '@tanstack/hotkeys'
import type { AdapterHotkeyDefinition } from '@tanstack/hotkeys/adapter'
import type { MaybeGetter } from './internal.svelte.js'
import type {
  CreateAppHotkeyOptions,
  CreateHotkeyChordOptions,
  CreateHotkeyCommonOptions,
  CreateHotkeyOptions,
  CreateHotkeySequenceOptions,
  CreateHotkeyTarget,
} from './createHotkey.svelte.js'

/**
 * One hotkey for `createHotkeys`. The hotkey and options may be getters.
 * Chords accept `requireReset`; sequences accept `timeout`; hotkeys of unknown
 * kind accept only shared options.
 */
export type CreateHotkeyDefinition =
  | {
      /** A chord string such as `'Mod+S'`, or a chord object */
      hotkey: MaybeGetter<RegisterableHotkeyChord>
      /** The function to call when the hotkey is pressed */
      callback: HotkeyCallback
      /** Per-hotkey options (merged on top of commonOptions) */
      options?: MaybeGetter<CreateHotkeyChordOptions>
    }
  | {
      /** A sequence such as `['G', 'G']`, with each step a string or an object */
      hotkey: MaybeGetter<RegisterableHotkeySequence>
      callback: HotkeyCallback
      options?: MaybeGetter<CreateHotkeySequenceOptions>
    }
  | {
      /** An app hotkey from `defineAppHotkeys` */
      hotkey: MaybeGetter<AppHotkey>
      callback: HotkeyCallback
      options?: MaybeGetter<CreateAppHotkeyOptions>
    }
  | {
      /** A hotkey whose kind is not known statically. Accepts only shared options. */
      hotkey: MaybeGetter<RegisterableHotkey>
      callback: HotkeyCallback
      options?: MaybeGetter<CreateHotkeyOptions>
    }

/**
 * Registers definitions in an effect. With an element, every hotkey listens on
 * that element; otherwise each uses its own target (document by default).
 */
function bindHotkeys(
  hotkeys: MaybeGetter<ReadonlyArray<CreateHotkeyDefinition>>,
  commonOptions: MaybeGetter<CreateHotkeyCommonOptions>,
  element?: HTMLElement,
) {
  const context = getHotkeysContext()
  const subscribeAppHotkeys = createAppHotkeysSubscriber(
    context?.appHotkeysStore ?? null,
  )
  const bindings = createHotkeyBindings()

  $effect(() => {
    if (typeof document === 'undefined') {
      return
    }
    // Track app hotkeys so registrations move with custom hotkeys.
    subscribeAppHotkeys()
    const definitions = resolveMaybeGetter(hotkeys).map(
      (definition) =>
        ({
          hotkey: resolveMaybeGetter(definition.hotkey),
          callback: definition.callback,
          options: definition.options
            ? resolveMaybeGetter(definition.options)
            : undefined,
        }) as AdapterHotkeyDefinition<CreateHotkeyTarget | HTMLElement>,
    )
    bindings.update(
      prepareHotkeyDefinitions(definitions, {
        appHotkeysStore: context?.appHotkeysStore,
        defaults: context?.defaultOptions.hotkey,
        commonOptions: element
          ? { ...resolveMaybeGetter(commonOptions), target: element }
          : resolveMaybeGetter(commonOptions),
        resolveTarget: element ? () => element : undefined,
      }),
    )
  })

  return bindings
}

/**
 * Svelte function for registering several hotkeys at once on the document:
 * chords, sequences, and app hotkeys. Pass getters for reactive values. Use
 * `createHotkeysAttachment` for element-scoped hotkeys.
 *
 * Options merge in this order: provider defaults, app hotkey declaration,
 * commonOptions, per-hotkey options. Each option applies only to the kinds
 * that support it. Unbound app hotkeys and empty sequences register nothing.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   createHotkeys([
 *     { hotkey: 'Mod+S', callback: () => save() },
 *     { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
 *   ])
 * </script>
 * ```
 */
export function createHotkeys(
  hotkeys: MaybeGetter<ReadonlyArray<CreateHotkeyDefinition>>,
  commonOptions: MaybeGetter<CreateHotkeyCommonOptions> = {},
): void {
  const bindings = bindHotkeys(hotkeys, commonOptions)
  onDestroy(() => bindings.destroy())
}

/**
 * Create an attachment for element-scoped hotkeys: chords, sequences, and app
 * hotkeys listen on the attached element.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const editorKeys = createHotkeysAttachment([
 *     { hotkey: 'Mod+S', callback: () => save() },
 *     { hotkey: ['G', 'G'], callback: () => scrollToTop() },
 *   ])
 * </script>
 *
 * <div tabindex="0" {@attach editorKeys}>Editor content</div>
 * ```
 */
export function createHotkeysAttachment(
  hotkeys: MaybeGetter<ReadonlyArray<CreateHotkeyDefinition>>,
  commonOptions: MaybeGetter<CreateHotkeyCommonOptions> = {},
): Attachment<HTMLElement> {
  return (element) => {
    const bindings = bindHotkeys(hotkeys, commonOptions, element)
    return () => bindings.destroy()
  }
}
