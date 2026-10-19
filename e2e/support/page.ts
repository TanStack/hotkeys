// Bundled into each test page (see bundle.ts). Exposes the library and a small
// harness on `window` so tests can register hotkeys and read what fired.
import * as Hotkeys from '../../packages/hotkeys/src'
import type {
  HotkeyOptions,
  HotkeyRecorderOptions,
  HotkeyRegistrationHandle,
  RegisterableHotkey,
} from '../../packages/hotkeys/src'

/** One callback run, with the event as the callback saw it. */
export interface Fired {
  name: string
  type: string
  key: string
  code: string
  defaultPrevented: boolean
  /** The active element's id when the callback ran. */
  focus: string
}

/** One keydown as the page saw it, before any hotkey handled it. */
export interface ObservedKeydown {
  key: string
  code: string
  ctrlKey: boolean
  altKey: boolean
  shiftKey: boolean
  metaKey: boolean
  altGraph: boolean
  repeat: boolean
  /** Bindings from `observe()` that `matchesKeyboardEvent` accepts. */
  matches: Array<string>
  /** `normalizeHotkey(parseKeyboardEvent(event))`. */
  parsed: string
}

/** Registration options with `target` given as a CSS selector. */
export type HarnessOptions = Omit<HotkeyOptions, 'target'> & {
  target?: string
  requireReset?: boolean
  timeout?: number
}

const MODIFIER_KEYS = ['Control', 'Alt', 'AltGraph', 'Shift', 'Meta']

function createHarness() {
  const fired: Array<Fired> = []
  const keydowns: Array<ObservedKeydown> = []
  const handles = new Map<string, HotkeyRegistrationHandle>()
  let observed: Array<string> = []
  let platform: 'mac' | 'windows' | 'linux' | undefined
  let recorder: Hotkeys.HotkeyRecorder | undefined
  let recorded: unknown

  // Capture on window runs before the manager's document listeners.
  window.addEventListener(
    'keydown',
    (event) => {
      if (MODIFIER_KEYS.includes(event.key)) return
      keydowns.push({
        key: event.key,
        code: event.code,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
        altGraph: event.getModifierState('AltGraph'),
        repeat: event.repeat,
        matches: observed.filter((binding) =>
          Hotkeys.matchesKeyboardEvent(
            event,
            binding as Hotkeys.HotkeyChord,
            platform,
          ),
        ),
        parsed: Hotkeys.normalizeHotkey(
          Hotkeys.parseKeyboardEvent(event, platform),
          platform,
        ),
      })
    },
    true,
  )

  return {
    fired,
    keydowns,
    /** Platform passed to matching, parsing and registration. Defaults to detection. */
    setPlatform(value: 'mac' | 'windows' | 'linux' | undefined) {
      platform = value
    },
    /** Bindings to check against every keydown with `matchesKeyboardEvent`. */
    observe(bindings: Array<string>) {
      observed = bindings
    },
    register(
      name: string,
      hotkey: RegisterableHotkey,
      { target, ...options }: HarnessOptions = {},
    ) {
      const element = target ? document.querySelector(target) : undefined
      if (target && !element) throw new Error(`No element for ${target}`)
      const handle = Hotkeys.getHotkeyManager().register(
        hotkey,
        (event) => {
          fired.push({
            name,
            type: event.type,
            key: event.key,
            code: event.code,
            defaultPrevented: event.defaultPrevented,
            focus: document.activeElement?.id ?? '',
          })
        },
        {
          conflictBehavior: 'allow',
          ...(platform && { platform }),
          ...options,
          ...(element && { target: element as HTMLElement }),
        },
      )
      handles.set(name, handle)
    },
    setOptions(name: string, options: Partial<HotkeyOptions>) {
      handles.get(name)?.setOptions(options)
    },
    unregister(name: string) {
      handles.get(name)?.unregister()
      handles.delete(name)
    },
    activateScope(
      scope: string,
      options?: Hotkeys.ActivateHotkeyScopeOptions,
    ): void {
      const release = Hotkeys.getHotkeyManager().activateScope(scope, options)
      releases.set(scope, release)
    },
    releaseScope(scope: string) {
      releases.get(scope)?.()
      releases.delete(scope)
    },
    heldKeys(): Array<string> {
      return [...Hotkeys.getKeyStateTracker().getHeldKeys()]
    },
    heldCodes(): Record<string, string> {
      return { ...Hotkeys.getKeyStateTracker().store.state.heldCodes }
    },
    startRecorder(
      options: Omit<
        HotkeyRecorderOptions,
        'onRecord' | 'onReject' | 'onCancel' | 'onClear'
      > = {},
    ) {
      recorder?.destroy()
      recorded = undefined
      // The constructor overloads split chord and sequence options.
      recorder = new Hotkeys.HotkeyRecorder({
        ...(platform && { platform }),
        ...options,
        onRecord: (hotkey: unknown) => (recorded = hotkey),
        onReject: ({ reason }) => (recorded = { reject: reason }),
        onCancel: () => (recorded = 'cancelled'),
        onClear: () => (recorded = 'cleared'),
      } as Hotkeys.HotkeySequenceRecorderOptions)
      recorder.start()
    },
    recorderState() {
      return {
        recorded,
        isRecording: recorder?.store.state.isRecording ?? false,
        steps: [...(recorder?.store.state.steps ?? [])],
      }
    },
    stopRecorder() {
      recorder?.destroy()
      recorder = undefined
    },
    /** Clears logs between steps of one test. Registrations stay. */
    clear() {
      fired.length = 0
      keydowns.length = 0
    },
  }
}

const releases = new Map<string, () => void>()

declare global {
  interface Window {
    TanStackHotkeys: typeof Hotkeys
    harness: ReturnType<typeof createHarness>
  }
}

window.TanStackHotkeys = Hotkeys
window.harness = createHarness()
