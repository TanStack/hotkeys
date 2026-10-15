import { HotkeyController } from '../controllers/hotkey'
import type { LitElement } from 'lit'
import type {
  AppHotkey,
  HotkeyCallback,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type {
  AppHotkeyControllerOptions,
  HotkeyControllerCommonOptions,
  HotkeyControllerOptionsFor,
} from '../controllers/hotkey'

type HotkeyDecorator = <T extends HotkeyCallback>(
  proto: LitElement,
  propertyKey: string,
  descriptor?: TypedPropertyDescriptor<T>,
) => void

/**
 * Decorator that registers a hotkey on the element when it connects and
 * unregisters when it disconnects: a chord such as `'Mod+S'`, a sequence such
 * as `['G', 'G']`, or an app hotkey. Uses {@link HotkeyController} under the hood.
 *
 * @param hotkey - The chord, sequence, or app hotkey to listen for.
 * @param options - Optional registration options (target, platform, enabled, etc.).
 * @returns A method decorator for use on LitElement methods.
 *
 * @example
 * ```ts
 * class MyElement extends LitElement {
 *   @hotkey('Mod+S')
 *   save() { this.doSave() }
 *
 *   @hotkey(['G', 'G'], { timeout: 500 })
 *   goToTop() { window.scrollTo(0, 0) }
 * }
 * ```
 */
export function hotkey<T extends AppHotkey>(
  hotkey: T,
  options?: AppHotkeyControllerOptions<T>,
): HotkeyDecorator
export function hotkey<T extends RegisterableHotkey>(
  hotkey: T,
  options?: HotkeyControllerOptionsFor<T>,
): HotkeyDecorator
export function hotkey(
  hotkey: RegisterableHotkey | AppHotkey,
  options: HotkeyControllerCommonOptions = {},
): HotkeyDecorator {
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

        const controller = new HotkeyController(
          this,
          hotkey as RegisterableHotkey,
          callback,
          options,
        )
        host[controllerKey] = controller
        this.addController(controller)
      }
    }
  }
}
