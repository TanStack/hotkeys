import {
  HotkeyManager,
  KeyStateTracker,
  getKeyboardLayoutStore,
  loadKeyboardLayout,
  toHotkeyRegistrationView,
} from '@tanstack/hotkeys'
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onSettled,
  useContext,
} from 'solid-js'
import { needsSequenceProgressClock } from './sequence-progress'
import type {
  AppHotkeyListItem,
  AppHotkeysStore,
  HotkeyRegistrationView,
  HotkeyScopesState,
  KeyboardLayoutMap,
} from '@tanstack/hotkeys'
import type { Accessor } from 'solid-js'

interface HotkeysDevtoolsContextType {
  /** Every registration, chords and sequences. */
  registrations: Accessor<Array<HotkeyRegistrationView>>
  /** Declared app hotkeys from a framework provider, with live status. Empty without one. */
  appHotkeys: Accessor<Array<AppHotkeyListItem>>
  /** Active hotkey scopes. */
  scopes: Accessor<HotkeyScopesState>
  heldKeys: Accessor<Array<string>>
  heldCodes: Accessor<Record<string, string>>
  /** Monotonic clock for sequence in-progress UI (updates while a sequence match is active). */
  sequenceProgressNow: Accessor<number>
  /** The browser's keyboard layout, or null where it reports none. */
  keyboardLayout: Accessor<KeyboardLayoutMap | null>
}

const HotkeysDevtoolsContext = createContext<HotkeysDevtoolsContextType>({
  registrations: () => [],
  appHotkeys: () => [],
  scopes: () => ({ active: [], exclusive: null, allowed: [], suspended: [] }),
  heldKeys: () => [],
  heldCodes: () => ({}),
  sequenceProgressNow: () => Date.now(),
  keyboardLayout: () => null,
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
  const [scopes, setScopes] = createSignal<HotkeyScopesState>(
    manager.scopes.state,
  )
  const [heldKeys, setHeldKeys] = createSignal<Array<string>>(
    tracker.store.state.heldKeys,
  )
  const [heldCodes, setHeldCodes] = createSignal<Record<string, string>>(
    tracker.store.state.heldCodes,
  )

  // Subscribe to HotkeyManager registrations store
  onSettled(
    () =>
      manager.registrations.subscribe(() => {
        setRegistrations(readRegistrations(manager))
      }).unsubscribe,
  )

  onSettled(
    () =>
      manager.scopes.subscribe(() => {
        setScopes(manager.scopes.state)
      }).unsubscribe,
  )

  // Load the keyboard layout, as labels in the app do, so the panel shows it
  // even when no label is on screen. An app that turned the layout off for
  // its labels ignores the store.
  const layoutStore = getKeyboardLayoutStore()
  const [keyboardLayout, setKeyboardLayout] = createSignal(layoutStore.state)
  onSettled(() => {
    const unsubscribe = layoutStore.subscribe(() => {
      setKeyboardLayout(() => layoutStore.state)
    }).unsubscribe
    const stop = loadKeyboardLayout()
    return () => {
      unsubscribe()
      stop()
    }
  })

  // Follow the app hotkeys store a provider publishes, and its changes
  onSettled(
    () =>
      manager.appHotkeys.subscribe(() => {
        setAppHotkeysStore(manager.appHotkeys.state)
      }).unsubscribe,
  )
  createEffect(
    () => appHotkeysStore(),
    (store) => {
      if (!store) return
      return store.store.subscribe(() => {
        setAppHotkeysVersion((version) => version + 1)
      }).unsubscribe
    },
  )
  const appHotkeys = createMemo(() => {
    appHotkeysVersion()
    return appHotkeysStore()?.getList(registrations()) ?? []
  })

  // Subscribe to KeyStateTracker store
  onSettled(
    () =>
      tracker.store.subscribe(() => {
        setHeldKeys(tracker.store.state.heldKeys)
        setHeldCodes(tracker.store.state.heldCodes)
      }).unsubscribe,
  )

  // The time that sequence progress is measured at. Derived, so a
  // registration change and the time it is measured at land in the same
  // flush. The interval only ticks it while a sequence is in progress.
  const [clock, setClock] = createSignal(0)
  const sequenceProgressNow = createMemo(() => {
    registrations()
    clock()
    return Date.now()
  })

  createEffect(
    () => registrations(),
    (regs) => {
      if (!needsSequenceProgressClock(regs, Date.now())) return
      const id = setInterval(() => {
        setClock((tick) => tick + 1)
        if (!needsSequenceProgressClock(regs, Date.now())) clearInterval(id)
      }, 50)
      return () => clearInterval(id)
    },
  )

  return (
    <HotkeysDevtoolsContext
      value={{
        registrations,
        appHotkeys,
        scopes,
        heldKeys,
        heldCodes,
        sequenceProgressNow,
        keyboardLayout,
      }}
    >
      {props.children}
    </HotkeysDevtoolsContext>
  )
}

export function useHotkeysDevtoolsState() {
  return useContext(HotkeysDevtoolsContext)
}
