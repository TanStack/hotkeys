import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  useContext,
} from 'solid-js'
import {
  HotkeyManager,
  KeyStateTracker,
  SequenceManager,
} from '@tanstack/hotkeys'
import { needsSequenceProgressClock } from './sequence-progress'
import type { Accessor } from 'solid-js'
import type {
  HotkeyRegistration,
  SequenceRegistrationView,
} from '@tanstack/hotkeys'

interface HotkeysDevtoolsContextType {
  registrations: Accessor<Array<HotkeyRegistration>>
  sequenceRegistrations: Accessor<Array<SequenceRegistrationView>>
  heldKeys: Accessor<Array<string>>
  heldCodes: Accessor<Record<string, string>>
  /** Monotonic clock for sequence in-progress UI (updates while a sequence match is active). */
  sequenceProgressNow: Accessor<number>
}

const HotkeysDevtoolsContext = createContext<HotkeysDevtoolsContextType>({
  registrations: () => [],
  sequenceRegistrations: () => [],
  heldKeys: () => [],
  heldCodes: () => ({}),
  sequenceProgressNow: () => Date.now(),
})

export function HotkeysContextProvider(props: { children: any }) {
  const manager = HotkeyManager.getInstance()
  const sequenceManager = SequenceManager.getInstance()
  const tracker = KeyStateTracker.getInstance()

  // Create local signals that will be updated by subscriptions
  const [registrations, setRegistrations] = createSignal<
    Array<HotkeyRegistration>
  >(Array.from(manager.registrations.state.values()))
  const [sequenceRegistrations, setSequenceRegistrations] = createSignal<
    Array<SequenceRegistrationView>
  >(Array.from(sequenceManager.registrations.state.values()))
  const [heldKeys, setHeldKeys] = createSignal<Array<string>>(
    tracker.store.state.heldKeys,
  )
  const [heldCodes, setHeldCodes] = createSignal<Record<string, string>>(
    tracker.store.state.heldCodes,
  )

  // Subscribe to HotkeyManager registrations store
  createEffect(() => {
    const unsubscribe = manager.registrations.subscribe(() => {
      setRegistrations(Array.from(manager.registrations.state.values()))
    }).unsubscribe
    onCleanup(() => unsubscribe())
  })

  // Subscribe to SequenceManager registrations store
  createEffect(() => {
    const unsubscribe = sequenceManager.registrations.subscribe(() => {
      setSequenceRegistrations(
        Array.from(sequenceManager.registrations.state.values()),
      )
    }).unsubscribe
    onCleanup(() => unsubscribe())
  })

  // Subscribe to KeyStateTracker store
  createEffect(() => {
    const unsubscribe = tracker.store.subscribe(() => {
      setHeldKeys(tracker.store.state.heldKeys)
      setHeldCodes(tracker.store.state.heldCodes)
    }).unsubscribe
    onCleanup(() => unsubscribe())
  })

  const [sequenceProgressNow, setSequenceProgressNow] = createSignal(Date.now())

  createEffect(() => {
    const regs = sequenceRegistrations()
    let id: ReturnType<typeof setInterval> | undefined

    const tick = () => {
      const t = Date.now()
      setSequenceProgressNow(t)
      if (!needsSequenceProgressClock(sequenceRegistrations(), t)) {
        if (id !== undefined) {
          clearInterval(id)
          id = undefined
        }
      }
    }

    if (needsSequenceProgressClock(regs, Date.now())) {
      id = setInterval(tick, 50)
    } else {
      setSequenceProgressNow(Date.now())
    }

    onCleanup(() => {
      if (id !== undefined) {
        clearInterval(id)
      }
    })
  })

  return (
    <HotkeysDevtoolsContext.Provider
      value={{
        registrations,
        sequenceRegistrations,
        heldKeys,
        heldCodes,
        sequenceProgressNow,
      }}
    >
      {props.children}
    </HotkeysDevtoolsContext.Provider>
  )
}

export function useHotkeysDevtoolsState() {
  return useContext(HotkeysDevtoolsContext)
}
