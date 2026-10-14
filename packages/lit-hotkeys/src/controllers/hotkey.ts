import {
  createHotkeyBindings,
  prepareHotkeyDefinitions,
} from '@tanstack/hotkeys/adapter'
import { getAppHotkeysStore, subscribeAppHotkeys } from './_app-hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import type {
  AppHotkey,
  HotkeyCallback,
  RegisterableHotkey,
  Target,
} from '@tanstack/hotkeys'
import type {
  AdapterAppHotkeyOptions,
  AdapterChordOptions,
  AdapterCommonOptions,
  AdapterHotkeyOptions,
  AdapterOptionsFor,
  AdapterSequenceOptions,
} from '@tanstack/hotkeys/adapter'

/** The element to listen on. A `null` target skips registration until it is set. */
export type HotkeyControllerTarget = Target | null

/** Options shared by chords and sequences. */
export type HotkeyControllerOptions =
  AdapterHotkeyOptions<HotkeyControllerTarget>

/** Options for a chord such as `'Mod+S'`. */
export type HotkeyControllerChordOptions =
  AdapterChordOptions<HotkeyControllerTarget>

/** Options for a sequence such as `['G', 'G']`. */
export type HotkeyControllerSequenceOptions =
  AdapterSequenceOptions<HotkeyControllerTarget>

/** Options for every kind; each applies to the kinds that support it. */
export type HotkeyControllerCommonOptions =
  AdapterCommonOptions<HotkeyControllerTarget>

/** The options type for a hotkey: chord options for chords, sequence options for sequences. */
export type HotkeyControllerOptionsFor<T extends RegisterableHotkey> =
  AdapterOptionsFor<T, HotkeyControllerTarget>

/** Call-site options for an app hotkey, typed by its declared default kind. */
export type AppHotkeyControllerOptions<T extends AppHotkey = AppHotkey> =
  AdapterAppHotkeyOptions<T, HotkeyControllerTarget>

type MaybeGetter<T> = T | (() => T)

/**
 * A Lit ReactiveController that registers a hotkey when the host element is
 * connected and unregisters it when the host is disconnected. The hotkey can
 * be a chord such as `'Mod+S'`, a sequence such as `['G', 'G']`, or an app
 * hotkey from `defineAppHotkeys`, which uses its custom hotkey from
 * `provideAppHotkeys`.
 *
 * Chords accept `requireReset`; sequences accept `timeout`.
 *
 * @example
 * ```ts
 * class MyElement extends LitElement {
 *   private save = new HotkeyController(this, 'Mod+S', () => this.doSave())
 *   private top = new HotkeyController(this, ['G', 'G'], () => this.scrollToTop())
 *
 *   constructor() {
 *     super()
 *     this.addController(this.save)
 *     this.addController(this.top)
 *   }
 * }
 * ```
 */
export class HotkeyController implements ReactiveController {
  private _bindings = createHotkeyBindings()
  private _connected = false
  private _boundCallback: HotkeyCallback
  private _unsubscribe: (() => void) | undefined

  /**
   * @param host - The Lit component that owns this controller. Add the controller with `addController()`.
   * @param hotkey - The chord, sequence, or app hotkey to register.
   * @param callback - Called with the host as `this`.
   * @param options - Options or a getter. Property getters are read on connection and after host updates.
   */
  constructor(
    host: ReactiveControllerHost,
    hotkey: AppHotkey,
    callback: HotkeyCallback,
    options?: MaybeGetter<AppHotkeyControllerOptions>,
  )
  constructor(
    host: ReactiveControllerHost,
    hotkey: RegisterableHotkey,
    callback: HotkeyCallback,
    options?: MaybeGetter<HotkeyControllerCommonOptions>,
  )
  constructor(
    private _host: ReactiveControllerHost,
    private _hotkey: RegisterableHotkey | AppHotkey,
    callback: HotkeyCallback,
    private _options: MaybeGetter<HotkeyControllerCommonOptions> = {},
  ) {
    this._boundCallback = callback.bind(this._host)
  }

  /** Registers when connected and a target is available. */
  public hostConnected(): void {
    this._connected = true
    this._unsubscribe = subscribeAppHotkeys(() => this._sync())
    this._sync()
  }

  /** Refreshes options after rendering, when scoped targets are available. */
  public hostUpdated(): void {
    if (this._connected) this._sync()
  }

  private _sync(): void {
    const options =
      typeof this._options === 'function' ? this._options() : this._options
    this._bindings.update(
      prepareHotkeyDefinitions<HotkeyControllerTarget>(
        [
          {
            hotkey: this._hotkey,
            callback: this._boundCallback,
            options,
          } as never,
        ],
        {
          appHotkeysStore: getAppHotkeysStore(),
          // A null target skips registration until the element exists.
          resolveTarget: (target) => target,
        },
      ),
    )
  }

  /** Releases registrations when the host disconnects. */
  public hostDisconnected(): void {
    this._connected = false
    this._unsubscribe?.()
    this._unsubscribe = undefined
    this._bindings.destroy()
  }
}
