import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import {
  getHotkeyManager,
  isAppHotkey,
  isHotkeySequence,
} from '@tanstack/hotkeys'
import {
  createHotkeyBindings,
  prepareHotkeyDefinitions,
  subscribePublishedAppHotkeys,
} from '@tanstack/hotkeys/adapter'
import type { EmberHotkeyCommonOptions, EmberHotkeyDefinition } from './types'

/** Copies a hotkey so tracked getters are read while Ember tracks the caller. */
function copyHotkey(
  hotkey: EmberHotkeyDefinition['hotkey'],
): EmberHotkeyDefinition['hotkey'] {
  if (typeof hotkey === 'string' || isAppHotkey(hotkey)) return hotkey
  if (isHotkeySequence(hotkey)) return [...hotkey]
  return { ...hotkey }
}

/**
 * Registrations owned by a helper or modifier. `set` records the latest
 * definitions while Ember tracks the caller; registration changes publish
 * after rendering, and again when app hotkeys or custom hotkeys change.
 */
export function createOwnedBindings(owner: object) {
  const bindings = createHotkeyBindings()
  const state: {
    definitions: ReadonlyArray<EmberHotkeyDefinition>
    commonOptions: EmberHotkeyCommonOptions
    element: HTMLElement | undefined
  } = { definitions: [], commonOptions: {}, element: undefined }

  function update(): void {
    if (isDestroying(owner) || isDestroyed(owner)) return
    const { definitions, commonOptions, element } = state
    bindings.update(
      prepareHotkeyDefinitions(definitions, {
        appHotkeysStore: getHotkeyManager().appHotkeys.state,
        commonOptions: element
          ? { ...commonOptions, target: element }
          : commonOptions,
        // A modifier always listens on its element; otherwise a null target
        // skips registration until it is set.
        resolveTarget: element ? () => element : (target) => target,
      }),
    )
  }

  const schedule = () => scheduleOnce('afterRender', state, update)
  const unsubscribe = subscribePublishedAppHotkeys(schedule)
  registerDestructor(owner, () => {
    unsubscribe()
    bindings.destroy()
  })

  return {
    set(
      definitions: ReadonlyArray<EmberHotkeyDefinition>,
      commonOptions: EmberHotkeyCommonOptions,
      element?: HTMLElement,
    ): void {
      state.definitions = definitions.map(
        (definition) =>
          ({
            ...definition,
            hotkey: copyHotkey(definition.hotkey),
            options: { ...definition.options },
          }) as EmberHotkeyDefinition,
      )
      state.commonOptions = { ...commonOptions }
      state.element = element
      schedule()
    },
  }
}
