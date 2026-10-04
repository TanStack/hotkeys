import { createHotkeysScope } from './createHotkeysScope'
import type Alpine from 'alpinejs'
import type { AlpineHotkeys } from './createHotkeysScope'

/** Installs $hotkeys, whose registrations and subscriptions belong to its element. */
export function hotkeysPlugin(alpine: typeof Alpine): void {
  const scopes = new WeakMap<Element, AlpineHotkeys>()
  alpine.magic('hotkeys', (element, { cleanup }) => {
    let scope = scopes.get(element)
    if (!scope) {
      scope = createHotkeysScope()
      scopes.set(element, scope)
      const ownedScope = scope
      cleanup(() => {
        ownedScope.destroy()
        scopes.delete(element)
      })
    }
    return scope
  })
}
