import { formatHotkeySequence, getSequenceManager } from '@tanstack/hotkeys'
import { onDestroy } from 'svelte'
import { SvelteMap, SvelteSet } from 'svelte/reactivity'
import { getDefaultHotkeysOptions } from './HotkeysCtx'
import { resolveMaybeGetter } from './internal.svelte'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceRegistrationHandle,
} from '@tanstack/hotkeys'
import type { CreateHotkeySequenceOptions } from './createHotkeySequence.svelte'
import type { MaybeGetter } from './internal.svelte'
import type { Attachment } from 'svelte/attachments'

/**
 * A single sequence definition for use with `createHotkeySequences`.
 */
export interface CreateHotkeySequenceDefinition {
  /** Array of hotkey strings that form the sequence */
  sequence: MaybeGetter<HotkeySequence>
  /** The function to call when the sequence is completed */
  callback: HotkeyCallback
  /** Per-sequence options (merged on top of commonOptions) */
  options?: MaybeGetter<CreateHotkeySequenceOptions>
}

type RegistrationRecord = {
  handle: SequenceRegistrationHandle
  target: Document | HTMLElement | Window
}

function cleanupRegistrations(
  registrations:
    | Map<string, RegistrationRecord>
    | SvelteMap<string, RegistrationRecord>,
) {
  for (const { handle } of registrations.values()) {
    if (handle.isActive) {
      handle.unregister()
    }
  }
  registrations.clear()
}

/**
 * Register multiple global keyboard shortcut sequences for the current component.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createHotkeySequences } from '@tanstack/svelte-hotkeys'
 *
 *   createHotkeySequences([
 *     { sequence: ['G', 'G'], callback: () => scrollToTop() },
 *     { sequence: ['D', 'D'], callback: () => deleteLine() },
 *   ])
 * </script>
 * ```
 */
export function createHotkeySequences(
  definitions: MaybeGetter<Array<CreateHotkeySequenceDefinition>>,
  commonOptions: MaybeGetter<CreateHotkeySequenceOptions> = {},
): void {
  const registrations = new SvelteMap<string, RegistrationRecord>()

  onDestroy(() => {
    cleanupRegistrations(registrations)
  })

  $effect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const resolvedDefinitions = resolveMaybeGetter(definitions)
    const resolvedCommonOptions = resolveMaybeGetter(commonOptions)
    const nextKeys = new SvelteSet<string>()
    const prepared: Array<{
      registrationKey: string
      def: CreateHotkeySequenceDefinition
      mergedOptions: CreateHotkeySequenceOptions
      sequenceString: string
      resolvedSequence: HotkeySequence
      resolvedTarget: Document | HTMLElement | Window
    }> = []

    for (let i = 0; i < resolvedDefinitions.length; i++) {
      const def = resolvedDefinitions[i]!
      const resolvedSequence = resolveMaybeGetter(def.sequence)
      if (resolvedSequence.length === 0) {
        continue
      }

      const resolvedDefOptions = def.options
        ? resolveMaybeGetter(def.options)
        : {}

      const mergedOptions = {
        ...getDefaultHotkeysOptions().hotkeySequence,
        ...resolvedCommonOptions,
        ...resolvedDefOptions,
      } as CreateHotkeySequenceOptions

      const resolvedTarget =
        mergedOptions.target ??
        (typeof document !== 'undefined' ? document : null)

      if (!resolvedTarget) {
        continue
      }

      const sequenceString = formatHotkeySequence(resolvedSequence)
      const registrationKey = `${i}:${sequenceString}`
      nextKeys.add(registrationKey)
      prepared.push({
        registrationKey,
        def,
        mergedOptions,
        sequenceString,
        resolvedSequence,
        resolvedTarget,
      })
    }

    for (const [key, record] of [...registrations.entries()]) {
      if (!nextKeys.has(key)) {
        if (record.handle.isActive) {
          record.handle.unregister()
        }
        registrations.delete(key)
      }
    }

    for (const p of prepared) {
      const existing = registrations.get(p.registrationKey)
      const { target: _target, ...optionsWithoutTarget } = p.mergedOptions

      if (existing?.handle.isActive && existing.target === p.resolvedTarget) {
        existing.handle.callback = p.def.callback
        existing.handle.setOptions(optionsWithoutTarget)
        continue
      }

      if (existing?.handle.isActive) {
        existing.handle.unregister()
      }
      if (existing) {
        registrations.delete(p.registrationKey)
      }

      const handle = getSequenceManager().register(
        p.resolvedSequence,
        p.def.callback,
        {
          ...optionsWithoutTarget,
          target: p.resolvedTarget,
        },
      )
      registrations.set(p.registrationKey, {
        handle,
        target: p.resolvedTarget,
      })
    }
  })
}

/**
 * Create an attachment for element-scoped multi-sequence registration.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   import { createHotkeySequencesAttachment } from '@tanstack/svelte-hotkeys'
 *
 *   const vim = createHotkeySequencesAttachment([
 *     { sequence: ['G', 'G'], callback: () => scrollToTop() },
 *     { sequence: ['D', 'D'], callback: () => deleteLine() },
 *   ])
 * </script>
 *
 * <div tabindex="0" {@attach vim}>Editor</div>
 * ```
 */
export function createHotkeySequencesAttachment(
  definitions: MaybeGetter<Array<CreateHotkeySequenceDefinition>>,
  commonOptions: MaybeGetter<CreateHotkeySequenceOptions> = {},
): Attachment<HTMLElement> {
  return (element) => {
    const registrations = new SvelteMap<string, RegistrationRecord>()

    $effect(() => {
      const resolvedDefinitions = resolveMaybeGetter(definitions)
      const resolvedCommonOptions = resolveMaybeGetter(commonOptions)
      const nextKeys = new SvelteSet<string>()
      const prepared: Array<{
        registrationKey: string
        def: CreateHotkeySequenceDefinition
        mergedOptions: CreateHotkeySequenceOptions
        sequenceString: string
        resolvedSequence: HotkeySequence
      }> = []

      for (let i = 0; i < resolvedDefinitions.length; i++) {
        const def = resolvedDefinitions[i]!
        const resolvedSequence = resolveMaybeGetter(def.sequence)
        if (resolvedSequence.length === 0) {
          continue
        }

        const resolvedDefOptions = def.options
          ? resolveMaybeGetter(def.options)
          : {}

        const mergedOptions = {
          ...getDefaultHotkeysOptions().hotkeySequence,
          ...resolvedCommonOptions,
          ...resolvedDefOptions,
        } as CreateHotkeySequenceOptions

        const sequenceString = formatHotkeySequence(resolvedSequence)
        const registrationKey = `${i}:${sequenceString}`
        nextKeys.add(registrationKey)
        prepared.push({
          registrationKey,
          def,
          mergedOptions,
          sequenceString,
          resolvedSequence,
        })
      }

      for (const [key, record] of [...registrations.entries()]) {
        if (!nextKeys.has(key)) {
          if (record.handle.isActive) {
            record.handle.unregister()
          }
          registrations.delete(key)
        }
      }

      for (const p of prepared) {
        const existing = registrations.get(p.registrationKey)
        const { target: _target, ...optionsWithoutTarget } = p.mergedOptions

        if (existing?.handle.isActive && existing.target === element) {
          existing.handle.callback = p.def.callback
          existing.handle.setOptions(optionsWithoutTarget)
          continue
        }

        if (existing?.handle.isActive) {
          existing.handle.unregister()
        }
        if (existing) {
          registrations.delete(p.registrationKey)
        }

        const handle = getSequenceManager().register(
          p.resolvedSequence,
          p.def.callback,
          {
            ...optionsWithoutTarget,
            target: element,
          },
        )
        registrations.set(p.registrationKey, { handle, target: element })
      }
    })

    return () => {
      cleanupRegistrations(registrations)
    }
  }
}
