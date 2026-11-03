import { HotkeyController } from '../controllers/hotkey'
import type { ReactiveElement } from 'lit'
import type {
  AppHotkey,
  HotkeyCallback,
  HotkeyCallbackContext,
  HotkeyCallbackContextFor,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type {
  AppHotkeyControllerOptions,
  HotkeyControllerCommonOptions,
  HotkeyControllerOptionsFor,
} from '../controllers/hotkey'

/**
 * A method decorator for legacy (`experimentalDecorators`) and standard
 * decorators. The method's context parameter can be typed as the context for
 * the decorated hotkey's kind, such as `HotkeyChordCallbackContext`.
 */
export type HotkeyDecorator<
  TContext extends HotkeyCallbackContext = HotkeyCallbackContext,
> = {
  // Legacy decorators.
  <T extends HotkeyCallback<TContext>>(
    proto: ReactiveElement,
    name: string | symbol,
    descriptor?: TypedPropertyDescriptor<T>,
  ): void
  // Standard decorators.
  <THost extends ReactiveElement, T extends HotkeyCallback<TContext>>(
    method: T,
    context: ClassMethodDecoratorContext<THost, T>,
  ): void
}

/**
 * Decorator that registers a hotkey on the element when it connects and
 * unregisters when it disconnects: a chord such as `'Mod+S'`, a sequence such
 * as `['G', 'G']`, or an app hotkey. Uses {@link HotkeyController} under the hood.
 *
 * Works with legacy (`experimentalDecorators`) and standard decorators. The
 * method is looked up when the hotkey fires, so subclass overrides run.
 *
 * @param hotkey - The chord, sequence, or app hotkey to listen for.
 * @param options - Optional registration options (target, platform, enabled, etc.).
 * @returns A method decorator for use on Lit element methods.
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
export function hotkey<const T extends RegisterableHotkey>(
  hotkey: T,
  options?: HotkeyControllerOptionsFor<T>,
): HotkeyDecorator<HotkeyCallbackContextFor<T>>
export function hotkey(
  hotkey: RegisterableHotkey | AppHotkey,
  options?: HotkeyControllerCommonOptions,
): HotkeyDecorator {
  return (
    proto: ReactiveElement | HotkeyCallback,
    context: string | symbol | ClassMethodDecoratorContext,
  ) => {
    const standard = typeof context === 'object'
    const init = (host: ReactiveElement) => {
      new HotkeyController(
        host,
        hotkey as RegisterableHotkey,
        // Look the method up on each call so subclass overrides run.
        // `access.get` also reaches `#private` methods.
        function (this: any, event, callbackContext) {
          return (standard ? context.access.get(this) : this[context]).call(
            this,
            event,
            callbackContext,
          )
        },
        options,
      )
    }
    if (standard) {
      context.addInitializer(function (this: unknown) {
        init(this as ReactiveElement)
      })
    } else {
      ;(proto.constructor as typeof ReactiveElement).addInitializer(init)
    }
  }
}
