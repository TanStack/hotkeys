import {
  getHotkeyManager,
  getKeyStateTracker,
  isAppHotkey,
  matchesHeldModifiers,
  resolveAppHotkey,
} from '@tanstack/hotkeys'
import { getAppHotkeysStore, subscribeAppHotkeys } from './_app-hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import type {
  AppHotkey,
  HeldModifierOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

/** Modifier hint controller. Getter arguments can read reactive host properties. */
export class HotkeyHintController implements ReactiveController {
  private unsubscribe?: () => void
  private visible = false

  /** Attaches to the host; getter arguments can read changing reactive properties. */
  constructor(
    private host: ReactiveControllerHost,
    private hotkey:
      RegisterableHotkey | AppHotkey | (() => RegisterableHotkey | AppHotkey),
    private options: HeldModifierOptions | (() => HeldModifierOptions) = {},
  ) {
    host.addController(this)
  }

  /**
   * Current visibility. True only while the hotkey can fire: some registration
   * of it is enabled and in an active scope. Focus and `target` are not checked.
   */
  get value(): boolean {
    return this.visible
  }

  /**
   * Subscribes on connection, then requests renders only when hint visibility
   * changes. Reconnecting always requests one, since the hint may have changed
   * while disconnected.
   */
  hostConnected(): void {
    this.update()
    this.host.requestUpdate()
    const refresh = () => {
      if (this.update()) this.host.requestUpdate()
    }
    const subscription = getKeyStateTracker().store.subscribe(refresh)
    const registrations = getHotkeyManager().registrations.subscribe(refresh)
    const unsubscribeAppHotkeys = subscribeAppHotkeys(refresh)
    this.unsubscribe = () => {
      subscription.unsubscribe()
      registrations.unsubscribe()
      unsubscribeAppHotkeys()
    }
  }

  /** Re-evaluates getter arguments when host properties trigger an update. */
  hostUpdate(): void {
    this.update()
  }

  /** Releases the subscription and clears cached visibility while disconnected. */
  hostDisconnected(): void {
    this.unsubscribe?.()
    this.unsubscribe = undefined
    this.visible = false
  }

  /** Recomputes visibility and reports whether the host needs another render. */
  private update(): boolean {
    const value =
      typeof this.hotkey === 'function' ? this.hotkey() : this.hotkey
    // App hotkeys use their effective hotkey; a sequence uses its first step.
    const hotkey = isAppHotkey(value)
      ? resolveAppHotkey(value, getAppHotkeysStore()).hotkey
      : value
    const next =
      hotkey !== null &&
      matchesHeldModifiers(
        hotkey,
        getKeyStateTracker().store.state.heldKeys,
        typeof this.options === 'function' ? this.options() : this.options,
      ) &&
      getHotkeyManager().hasActiveRegistration(value)
    const changed = next !== this.visible
    this.visible = next
    return changed
  }
}
