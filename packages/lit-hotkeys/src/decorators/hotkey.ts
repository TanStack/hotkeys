import { HotkeyController } from '../controllers/hotkey'
import { HOTKEY_DEFAULT_OPTIONS } from '../constants'
import type { LitElement } from 'lit'
import type {
  HotkeyCallback,
  HotkeyOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

/**
 * Decorator that registers a keyboard hotkey on the element when it connects
 * and unregisters when it disconnects. Uses {@link HotkeyController} under the hood.
 *
 * @param hotkey - The key or key combo to listen for (e.g. `'Mod+S'` or a raw hotkey object).
 * @param options - Optional registration options (target, platform, enabled, etc.).
 * @returns A method decorator for use on LitElement methods.
 *
 * @example
 * ```ts
 * class MyElement extends LitElement {
 *   @hotkey('Mod+S')
 *   save() { this.doSave() }
 *
 *   @hotkey('Escape')
 *   close() { this.dismiss() }
 * }
 * ```
 */
export function hotkey(
  hotkey: RegisterableHotkey,
  options: HotkeyOptions = HOTKEY_DEFAULT_OPTIONS,
) {
  return function <T extends HotkeyCallback>(
    proto: LitElement,
    propertyKey: string,
    descriptor?: TypedPropertyDescriptor<T>,
  ) {
    const originalConnected = proto.connectedCallback
    const controllerKey = Symbol(`@hotkey:${propertyKey}`)

    proto.connectedCallback = function () {
      originalConnected.call(this)

      const host = this as unknown as {
        [key: symbol]: HotkeyController | undefined
        addController: (c: unknown) => void
        [key: string]: unknown
      }

      if (!host[controllerKey]) {
        const callback: HotkeyCallback = descriptor?.value
          ? descriptor.value.bind(this)
          : (host[propertyKey] as HotkeyCallback)

        if (typeof callback !== 'function') {
          throw new Error(`@hotkey decorator can only be applied to functions`)
        }

        const controller: HotkeyController = new HotkeyController(
          this,
          hotkey,
          callback,
          options,
        )
        host[controllerKey] = controller
        this.addController(controller)
      }
    }
  }
}
