import { HotkeyController } from '../controllers/hotkey'
import type {
  AppHotkey,
  HotkeyCallback,
  HotkeyCallbackContext,
  HotkeyCallbackContextFor,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { ReactiveElement } from 'lit'
import type {
  AppHotkeyControllerOptions,
  HotkeyControllerCommonOptions,
  HotkeyControllerOptionsFor,
} from '../controllers/hotkey'

// Each element's decorated methods: the class whose decorators own each one,
// and their controllers.
const owners = new WeakMap<
  ReactiveElement,
  Map<string | symbol, [owner: unknown, controllers: Array<HotkeyController>]>
>()

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
 * method is looked up when the hotkey fires, so subclass overrides run. A
 * subclass that decorates an override replaces the parent's hotkeys for that
 * method; an override without `@hotkey` keeps them.
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
    // Identifies the class that applied this decorator: its prototype, or with
    // standard decorators its metadata object. Lit defines `Symbol.metadata`.
    // Without it, fall back to the method, which a wrapping decorator stacked
    // between two `@hotkey`s would split.
    const owner = standard
      ? ((context.metadata as object | undefined) ?? proto)
      : proto
    const name = standard ? context.name : context
    const init = (host: ReactiveElement) => {
      const controller = new HotkeyController(
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
      // A subclass and its parent each have their own `#private` method.
      if (standard && context.private) return
      // Parent initializers run first, so a subclass that decorates the same
      // method replaces the parent's controllers.
      let methods = owners.get(host)
      if (!methods) owners.set(host, (methods = new Map()))
      const entry = methods.get(name)
      if (entry?.[0] === owner) entry[1].push(controller)
      else {
        entry?.[1].forEach((previous) => previous.dispose())
        methods.set(name, [owner, [controller]])
      }
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
