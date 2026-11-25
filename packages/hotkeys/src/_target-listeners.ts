import { getEscapeLayers, getTargetDocument } from './_event-target'
import { listen } from './_listen'
import type { HotkeyEventType, Target } from './hotkey.types'

/** A node a registration's listener can attach to. */
export type ListenerTarget = Target | ShadowRoot
type ListenerGroup = {
  ids: Set<string>
  keydown: EventListener
  keyup: EventListener
  /** The window counted for this group, kept in case the target moves. */
  view: Window | null
}

/** Shares keyboard listeners within each target and capture phase. */
export class TargetListeners {
  #targets = new Map<ListenerTarget, Map<boolean, ListenerGroup>>()
  /** Listener groups per window, and its Escape listener while any exist. */
  #windows = new Map<Window, { count: number; listener: EventListener }>()
  #processed = new WeakMap<
    KeyboardEvent,
    {
      ids: Set<string>
      groups: Set<Set<string>>
    }
  >()

  constructor(
    private dispatch: (
      event: KeyboardEvent,
      target: ListenerTarget,
      eventType: HotkeyEventType,
      capture: boolean,
      ids: Set<string>,
      first: boolean,
    ) => void,
  ) {}

  /**
   * Adds a registration to the target's shared listener. With `last`, an
   * existing listener moves after listeners added since it, such as one a
   * framework attached later to delegate key events.
   */
  add(
    target: ListenerTarget,
    capture: boolean,
    id: string,
    last = false,
  ): void {
    if (typeof document === 'undefined') return
    const phases = this.#targets.get(target) ?? new Map()
    let group = phases.get(capture)
    if (group && last) {
      for (const type of ['keydown', 'keyup'] as const) {
        target.removeEventListener(type, group[type], capture)
        listen(target, type, group[type], capture)
      }
    }
    if (!group) {
      const ids = new Set<string>()
      const listener =
        (eventType: HotkeyEventType): EventListener =>
        (rawEvent) => {
          const event = rawEvent as KeyboardEvent
          let processed = this.#processed.get(event)
          // The same event object can be dispatched again. Seeing the same
          // group twice starts a new dispatch rather than suppressing it.
          const first = !processed || processed.groups.has(ids)
          if (!processed || first) {
            processed = { ids: new Set(), groups: new Set() }
            this.#processed.set(event, processed)
          }
          processed.groups.add(ids)
          // Snapshot before callbacks can move registrations between phases.
          // A moved registration must not process this event a second time.
          const pending = new Set<string>()
          for (const registrationId of ids) {
            if (!processed.ids.has(registrationId)) {
              processed.ids.add(registrationId)
              pending.add(registrationId)
            }
          }
          this.dispatch(event, target, eventType, capture, pending, first)
        }
      group = {
        ids,
        keydown: listener('keydown'),
        keyup: listener('keyup'),
        view: getTargetDocument(target as Target).defaultView,
      }
      // Attach first, so a target that can't listen leaves nothing behind.
      listen(target, 'keydown', group.keydown, capture)
      listen(target, 'keyup', group.keyup, capture)
      phases.set(capture, group)
      this.#targets.set(target, phases)
      this.#countWindow(group.view, 1)
    }
    group.ids.add(id)
  }

  remove(target: ListenerTarget, capture: boolean, id: string): void {
    const phases = this.#targets.get(target)
    const group = phases?.get(capture)
    if (!group) return
    group.ids.delete(id)
    if (group.ids.size === 0) {
      target.removeEventListener('keydown', group.keydown, capture)
      target.removeEventListener('keyup', group.keyup, capture)
      this.#countWindow(group.view, -1)
      phases!.delete(capture)
      if (phases!.size === 0) this.#targets.delete(target)
    }
  }

  destroy(): void {
    for (const [target, phases] of this.#targets) {
      for (const [capture, group] of phases) {
        target.removeEventListener('keydown', group.keydown, capture)
        target.removeEventListener('keyup', group.keyup, capture)
      }
    }
    this.#targets.clear()
    for (const [view, { listener }] of this.#windows) {
      view.removeEventListener('keydown', listener, true)
    }
    this.#windows.clear()
    this.#processed = new WeakMap()
  }

  /**
   * Counts a group added to or removed from a window. While the window has
   * groups, a capture listener there reads what an Escape press closes before
   * listeners on the document and its elements run. So a library that closes
   * its dialog first, such as from a document capture listener, doesn't hide
   * the dialog from the hotkeys after it.
   */
  #countWindow(view: Window | null, change: 1 | -1): void {
    if (!view) return
    let entry = this.#windows.get(view)
    if (!entry) {
      // Brave reports another `currentTarget`, so the listener keeps its window.
      const listener: EventListener = (event) => {
        if ((event as KeyboardEvent).key === 'Escape') {
          getEscapeLayers(event as KeyboardEvent, view.document)
        }
      }
      view.addEventListener('keydown', listener, true)
      entry = { count: 0, listener }
      this.#windows.set(view, entry)
    }
    entry.count += change
    if (entry.count === 0) {
      view.removeEventListener('keydown', entry.listener, true)
      this.#windows.delete(view)
    }
  }
}
