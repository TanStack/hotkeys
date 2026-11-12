import { isDestroying, registerDestructor } from '@ember/destroyable'
import { getKeyboardLayoutStore } from '@tanstack/hotkeys'
import { layoutEnabled, startLayout, untilRendered } from './keyboardLayout'
import { select } from './utils'
import type { KeyboardLayoutMap } from '@tanstack/hotkeys'
import type { EmberHotkeysScope } from './createHotkeysScope'
import type { EmberHotkeyState } from './types'

/**
 * The browser's keyboard layout, or `null` until it loads and in browsers
 * that don't report one. The layout maps each physical code to the character
 * it types, such as `KeyQ` to `a` on a French AZERTY keyboard. Only Chromium
 * browsers report one. Pass the containing component as owner.
 *
 * The layout loads after the render that created the utility, and is read
 * again when the window regains focus, until the owner is destroyed.
 * `useFormatForDisplay` already labels physical bindings with the layout, so
 * you only need this utility for labels you draw yourself, or to keep the
 * layout current while its owner lives.
 *
 * `value` is `null` in FastBoot and until the render that created the utility
 * has finished, so server-rendered labels rehydrate unchanged.
 *
 * To never ask the browser for the layout, pass a scope whose default options
 * set `keyboardLayout: false`. `value` is then `null`.
 *
 * @example
 * ```gts
 * class MoveKeys extends Component {
 *   layout = useKeyboardLayout(this)
 *
 *   label = (code: string) =>
 *     (this.layout.value?.get(code) ?? code).toUpperCase()
 *
 *   <template><kbd>{{this.label "KeyW"}}</kbd></template>
 * }
 * ```
 */
export function useKeyboardLayout(
  owner: object,
  scope?: EmberHotkeysScope,
): EmberHotkeyState<KeyboardLayoutMap | null> {
  const layout = select(
    owner,
    getKeyboardLayoutStore(),
    (layoutMap) => layoutMap,
  )
  let rendered = false
  let stop: (() => void) | undefined
  /** Loads the layout while the scope allows it, and stops when it doesn't. */
  const sync = () => {
    if (layoutEnabled(scope) && !isDestroying(owner)) {
      stop ??= startLayout()
    } else {
      stop?.()
      stop = undefined
    }
  }
  const read = untilRendered(
    () => layout.value,
    () => {
      rendered = true
      sync()
    },
  )
  registerDestructor(owner, () => stop?.())
  return {
    get value() {
      // Ember has no effects, so reading is what follows reactive defaults.
      if (rendered) sync()
      return layoutEnabled(scope) ? read() : null
    },
  }
}
