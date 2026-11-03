import { createRecorder } from './createHotkeyRecorder'
import { createScope, setAlpine } from './scope'
import type Alpine from 'alpinejs'
import type { AlpineCreateHotkeyRecorder } from './types'

/**
 * Installs $hotkeyRecorder, a function that creates recorders owned by its
 * element. It is separate from `hotkeysPlugin`, so apps that don't record
 * hotkeys don't ship the recorder.
 */
export function hotkeyRecorderPlugin(alpine: typeof Alpine): void {
  setAlpine(alpine)
  const owners = new WeakMap<Element, AlpineCreateHotkeyRecorder>()
  alpine.magic('hotkeyRecorder', (element, { cleanup }) => {
    let create = owners.get(element)
    if (!create) {
      const scope = createScope({})
      create = ((options) =>
        createRecorder(scope, options)) as AlpineCreateHotkeyRecorder
      owners.set(element, create)
      cleanup(() => {
        scope.destroy()
        owners.delete(element)
      })
    }
    return create
  })
}
