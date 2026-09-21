import { getKeyStateTracker, matchesHeldModifiers } from '@tanstack/hotkeys'
import type { ReactiveController, ReactiveControllerHost } from 'lit'
import type { HeldModifierOptions, RegisterableHotkey } from '@tanstack/hotkeys'

/** Modifier hint controller. Getter arguments can read reactive host properties. */
export class HotkeyHintController implements ReactiveController {
  private unsubscribe?: () => void
  private visible = false

  /** Attaches to the host; getter arguments can read changing reactive properties. */
  constructor(
    private host: ReactiveControllerHost,
    private hotkey: RegisterableHotkey | (() => RegisterableHotkey),
    private options: HeldModifierOptions | (() => HeldModifierOptions) = {},
  ) {
    host.addController(this)
  }

  /** Current visibility; combine with the action’s enabled state when rendering. */
  get value(): boolean {
    return this.visible
  }

  /** Subscribes on connection and requests renders only when hint visibility changes. */
  hostConnected(): void {
    this.update()
    const subscription = getKeyStateTracker().store.subscribe(() => {
      if (this.update()) this.host.requestUpdate()
    })
    this.unsubscribe = () => subscription.unsubscribe()
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
    const next = matchesHeldModifiers(
      typeof this.hotkey === 'function' ? this.hotkey() : this.hotkey,
      getKeyStateTracker().store.state.heldKeys,
      typeof this.options === 'function' ? this.options() : this.options,
    )
    const changed = next !== this.visible
    this.visible = next
    return changed
  }
}
