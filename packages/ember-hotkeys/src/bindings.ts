import {
  isDestroyed,
  isDestroying,
  registerDestructor,
} from '@ember/destroyable'
import { scheduleOnce } from '@ember/runloop'
import { isAppHotkey, isHotkeySequence } from '@tanstack/hotkeys'
import {
  createHotkeyBindings,
  getPublishedAppHotkeysStore,
  prepareHotkeyDefinitions,
  subscribePublishedAppHotkeys,
} from '@tanstack/hotkeys/adapter'
import type { EmberHotkeyCommonOptions, EmberHotkeyDefinition } from './types'

/** Copies a hotkey so tracked getters are read while Ember tracks the caller. */
function copyHotkey(
  hotkey: EmberHotkeyDefinition['hotkey'],
): EmberHotkeyDefinition['hotkey'] {
  // No hotkey (undefined or null) registers nothing; keep it as is.
  if (hotkey == null) return hotkey
  if (typeof hotkey === 'string' || isAppHotkey(hotkey)) return hotkey
  if (isHotkeySequence(hotkey)) return [...hotkey]
  return { ...hotkey }
}

/**
 * Hotkey defaults for the helper and modifier classes a `createHotkeysScope`
 * scope creates. They are the lowest layer, below an app hotkey's declaration.
 */
export const classDefaults = new WeakMap<
  object,
  () => EmberHotkeyCommonOptions | undefined
>()

/** The scope defaults for a helper or modifier, including a subclass of one. */
function defaultsFor(owner: object): EmberHotkeyCommonOptions | undefined {
  for (
    let helper: unknown = owner.constructor;
    typeof helper === 'function';
    helper = Object.getPrototypeOf(helper)
  ) {
    const defaults = classDefaults.get(helper)
    if (defaults) return defaults()
  }
  return undefined
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
    defaults: EmberHotkeyCommonOptions | undefined
    element: HTMLElement | undefined
  } = {
    definitions: [],
    commonOptions: {},
    defaults: undefined,
    element: undefined,
  }

  function update(): void {
    if (isDestroying(owner) || isDestroyed(owner)) return
    const { definitions, commonOptions, defaults, element } = state
    bindings.update(
      prepareHotkeyDefinitions(definitions, {
        appHotkeysStore: getPublishedAppHotkeysStore(),
        defaults,
        commonOptions: element
          ? { ...commonOptions, target: element }
          : commonOptions,
        // A modifier always listens on its element; otherwise an unset target
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
      // Read while Ember tracks the caller, so reactive defaults re-run it.
      state.defaults = defaultsFor(owner)
      state.element = element
      schedule()
    },
  }
}
