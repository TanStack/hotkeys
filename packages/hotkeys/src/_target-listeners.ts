type Target = HTMLElement | Document | Window | ShadowRoot
type EventType = 'keydown' | 'keyup'
type ListenerGroup = {
  ids: Set<string>
  keydown: EventListener
  keyup: EventListener
}

/** Shares keyboard listeners within each target and capture phase. */
export class TargetListeners {
  #targets = new Map<Target, Map<boolean, ListenerGroup>>()
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
      target: Target,
      eventType: EventType,
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
  add(target: Target, capture: boolean, id: string, last = false): void {
    if (typeof document === 'undefined') return
    const phases = this.#targets.get(target) ?? new Map()
    let group = phases.get(capture)
    if (group && last) {
      for (const type of ['keydown', 'keyup'] as const) {
        target.removeEventListener(type, group[type], capture)
        target.addEventListener(type, group[type], capture)
      }
    }
    if (!group) {
      const ids = new Set<string>()
      const listener =
        (eventType: EventType): EventListener =>
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
      group = { ids, keydown: listener('keydown'), keyup: listener('keyup') }
      // Attach first, so a target that can't listen leaves nothing behind.
      target.addEventListener('keydown', group.keydown, capture)
      target.addEventListener('keyup', group.keyup, capture)
      phases.set(capture, group)
      this.#targets.set(target, phases)
    }
    group.ids.add(id)
  }

  remove(target: Target, capture: boolean, id: string): void {
    const phases = this.#targets.get(target)
    const group = phases?.get(capture)
    if (!group) return
    group.ids.delete(id)
    if (group.ids.size === 0) {
      target.removeEventListener('keydown', group.keydown, capture)
      target.removeEventListener('keyup', group.keyup, capture)
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
    this.#processed = new WeakMap()
  }
}
