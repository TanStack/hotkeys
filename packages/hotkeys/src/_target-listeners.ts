type Target = HTMLElement | Document | Window
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
    ) => void,
  ) {}

  add(target: Target, capture: boolean, id: string): void {
    if (typeof document === 'undefined') return
    let phases = this.#targets.get(target)
    if (!phases) {
      phases = new Map()
      this.#targets.set(target, phases)
    }
    let group = phases.get(capture)
    if (!group) {
      const ids = new Set<string>()
      const listener =
        (eventType: EventType): EventListener =>
        (rawEvent) => {
          const event = rawEvent as KeyboardEvent
          let processed = this.#processed.get(event)
          // The same event object can be dispatched again. Seeing the same
          // group twice starts a new dispatch rather than suppressing it.
          if (!processed || processed.groups.has(ids)) {
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
          this.dispatch(event, target, eventType, capture, pending)
        }
      group = { ids, keydown: listener('keydown'), keyup: listener('keyup') }
      phases.set(capture, group)
      target.addEventListener('keydown', group.keydown, capture)
      target.addEventListener('keyup', group.keyup, capture)
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
