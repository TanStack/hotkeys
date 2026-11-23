import { getHotkeyManager, getKeyStateTracker } from '@tanstack/hotkeys'
import {
  isHotkeyHintVisible,
  resolveMaybeGetter,
} from '@tanstack/hotkeys/adapter'
import { getAppHotkeysStore, subscribeAppHotkeys } from './_app-hotkeys'
import { isServer } from './_server'
import type {
  AppHotkey,
  HeldModifierOptions,
  MaybeGetter,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'

/**
 * Modifier hint controller. Getter arguments can read reactive host
 * properties. No hotkey (`undefined`, `null`, or `''`) is never visible.
 */
export class HotkeyHintController implements ReactiveController {
  private unsubscribe?: () => void
  private visible = false

  /** Attaches to the host; getter arguments can read changing reactive properties. */
  constructor(
    private host: ReactiveControllerHost,
    private hotkey: MaybeGetter<
      RegisterableHotkey | AppHotkey | null | undefined
    >,
    private options: MaybeGetter<HeldModifierOptions> = {},
  ) {
    host.addController(this)
  }

  /**
   * Current visibility. True only while the hotkey can fire: some registration
   * of it is enabled and in an active scope. A hotkey on an element counts only while focus is inside it.
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
    // Adding the controller again while connected calls this twice.
    if (this.unsubscribe) return
    this.update()
    this.host.requestUpdate()
    if (isServer()) return
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

  /**
   * Releases the controller now and removes it from its host. Use it to
   * remove a controller early: Lit's `removeController` alone leaves it active.
   */
  dispose(): void {
    this.hostDisconnected()
    this.host.removeController(this)
  }

  /** Recomputes visibility and reports whether the host needs another render. */
  private update(): boolean {
    // App hotkeys use their effective hotkey; a sequence uses its first step.
    const next = isHotkeyHintVisible(
      resolveMaybeGetter(this.hotkey),
      getKeyStateTracker().store.state.heldKeys,
      resolveMaybeGetter(this.options),
      getAppHotkeysStore(),
    )
    const changed = next !== this.visible
    this.visible = next
    return changed
  }
}
