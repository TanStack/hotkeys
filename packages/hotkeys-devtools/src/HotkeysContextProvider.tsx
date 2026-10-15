import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  useContext,
} from 'solid-js'
import {
  HotkeyManager,
  KeyStateTracker,
  toHotkeyRegistrationView,
} from '@tanstack/hotkeys'
import { needsSequenceProgressClock } from './sequence-progress'
import type { Accessor } from 'solid-js'
import type {
  AppHotkeyListItem,
  AppHotkeysStore,
  HotkeyRegistrationView,
} from '@tanstack/hotkeys'

interface HotkeysDevtoolsContextType {
  /** Every registration, chords and sequences. */
  registrations: Accessor<Array<HotkeyRegistrationView>>
  /** Declared app hotkeys from a framework provider, with live status. Empty without one. */
  appHotkeys: Accessor<Array<AppHotkeyListItem>>
  heldKeys: Accessor<Array<string>>
  heldCodes: Accessor<Record<string, string>>
  /** Monotonic clock for sequence in-progress UI (updates while a sequence match is active). */
  sequenceProgressNow: Accessor<number>
}

const HotkeysDevtoolsContext = createContext<HotkeysDevtoolsContextType>({
  registrations: () => [],
  appHotkeys: () => [],
  heldKeys: () => [],
  heldCodes: () => ({}),
  sequenceProgressNow: () => Date.now(),
})

function readRegistrations(
  manager: HotkeyManager,
): Array<HotkeyRegistrationView> {
  return Array.from(manager.registrations.state.values()).map(
    toHotkeyRegistrationView,
  )
}

export function HotkeysContextProvider(props: { children: any }) {
  const manager = HotkeyManager.getInstance()
  const tracker = KeyStateTracker.getInstance()

  // Create local signals that will be updated by subscriptions
  const [registrations, setRegistrations] = createSignal(
    readRegistrations(manager),
  )
  const [appHotkeysStore, setAppHotkeysStore] =
    createSignal<AppHotkeysStore | null>(manager.appHotkeys.state)
  const [appHotkeysVersion, setAppHotkeysVersion] = createSignal(0)
  const [heldKeys, setHeldKeys] = createSignal<Array<string>>(
    tracker.store.state.heldKeys,
  )
  const [heldCodes, setHeldCodes] = createSignal<Record<string, string>>(
    tracker.store.state.heldCodes,
  )

  // Subscribe to HotkeyManager registrations store
  createEffect(() => {
    const unsubscribe = manager.registrations.subscribe(() => {
      setRegistrations(readRegistrations(manager))
    }).unsubscribe
    onCleanup(() => unsubscribe())
  })

  // Follow the app hotkeys store a provider publishes, and its changes
  createEffect(() => {
    const unsubscribe = manager.appHotkeys.subscribe(() => {
      setAppHotkeysStore(manager.appHotkeys.state)
    }).unsubscribe
    onCleanup(() => unsubscribe())
  })
  createEffect(() => {
    const store = appHotkeysStore()
    if (!store) return
    const unsubscribe = store.store.subscribe(() => {
      setAppHotkeysVersion((version) => version + 1)
    }).unsubscribe
    onCleanup(() => unsubscribe())
  })
  const appHotkeys = createMemo(() => {
    appHotkeysVersion()
    return appHotkeysStore()?.getList(registrations()) ?? []
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
    const regs = registrations()
    let id: ReturnType<typeof setInterval> | undefined

    const tick = () => {
      const t = Date.now()
      setSequenceProgressNow(t)
      if (!needsSequenceProgressClock(registrations(), t)) {
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
        appHotkeys,
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
