import type {
  AppHotkey,
  AppHotkeys,
  CustomHotkeys,
  DisplayHotkey,
  FormatDisplayOptions,
  HeldModifierOptions,
  Hotkey,
  HotkeyCallback,
  HotkeyMeta,
  HotkeyPlatform,
  HotkeyRecorderOptions,
  HotkeyRegistrationView,
  HotkeySequence,
  IndividualKey,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

export type MaybePromise<T> = T | Promise<T>

/** One matcher set: the subset of Vitest's `expect` the suite uses. */
export interface Matchers {
  toBe: (expected: unknown) => void
  toEqual: (expected: unknown) => void
  toMatchObject: (expected: object) => void
  toHaveLength: (length: number) => void
  toHaveProperty: (property: string) => void
  toBeGreaterThan: (value: number) => void
}

export interface Assertion extends Matchers {
  not: Matchers
}

export type Expect = (actual: unknown) => Assertion

type Body = () => Promise<void>

/**
 * The test runner the suite registers its cases with. Vitest passes its own
 * functions; QUnit wraps `module`, `test` and `skip`.
 */
export interface ConformanceRunner {
  describe: (name: string, body: () => void) => void
  it: (name: string, body: Body) => void
  skip: (name: string, body: Body) => void
  /**
   * Runs a known-bug case and passes only while it still fails. Used when
   * `HOTKEYS_CONFORMANCE_BUGS=fail` checks that each known bug still fails.
   */
  fails?: (name: string, body: Body) => void
  beforeEach: (body: () => MaybePromise<void>) => void
  afterEach: (body: () => MaybePromise<void>) => void
  expect: Expect
}

/**
 * Areas an adapter may not have. A harness lists the ones it lacks with the
 * reason, and the suite leaves their cases out.
 */
export type ConformanceFeature =
  /**
   * A single-hotkey call, such as `useHotkey`, picks up a callback passed
   * again with a new identity. List calls are always expected to.
   */
  | 'callback-identity'
  /** `target` set to an element. */
  | 'element-target'
  /** The list form, such as `useHotkeys`. */
  | 'list-form'
  /** A provider or scope wrapper with `scope`, `enabled` and `exclusive`. */
  | 'provider-scope'
  /** Provider default options for hotkeys. */
  | 'provider-defaults'
  /** App hotkeys and custom hotkeys from the provider. */
  | 'app-hotkeys'
  /** App hotkeys that the provider gets after it first renders. */
  | 'late-app-hotkeys'
  | 'recorder'
  | 'hint'
  | 'format'

export interface ConformanceHotkeyOptions {
  enabled?: boolean
  eventType?: 'keydown' | 'keyup'
  meta?: HotkeyMeta
  platform?: HotkeyPlatform
  preventDefault?: boolean | 'always'
  requireReset?: boolean
  scope?: string
  /** `'element'` listens on the view's target element. */
  target?: 'element'
  timeout?: number
}

export interface ConformanceHotkey {
  /** A chord, a sequence, an app hotkey, or nothing. */
  hotkey: RegisterableHotkey | AppHotkey | null | undefined
  callback: HotkeyCallback
  options?: ConformanceHotkeyOptions
}

export interface ConformanceProvider {
  scope?: string
  enabled?: boolean
  exclusive?: boolean | { allow: Array<string> }
  appHotkeys?: AppHotkeys
  customHotkeys?: CustomHotkeys<AppHotkeys> | null
  platform?: HotkeyPlatform
  /** Provider defaults for every hotkey. */
  hotkey?: Omit<ConformanceHotkeyOptions, 'target'>
}

export interface HotkeysSpec {
  /**
   * `'single'` registers each entry with its own single-hotkey call, such as
   * `useHotkey`. `'list'` passes every entry to one list call, such as
   * `useHotkeys`.
   */
  form: 'single' | 'list'
  hotkeys: Array<ConformanceHotkey>
  /** Wraps the view in a provider when set. */
  provider?: ConformanceProvider
}

export interface HotkeysHandle {
  /** Applies a change and waits for the adapter to settle. */
  update: (next: Partial<HotkeysSpec>) => MaybePromise<void>
  /** The element that `target: 'element'` listens on. */
  element: () => HTMLElement
  unmount: () => MaybePromise<void>
}

export interface HeldKeysHandle {
  keys: () => Array<string>
  codes: () => Record<string, string>
  /** The key hold value for the watched key. */
  held: () => boolean
  setKey: (key: IndividualKey) => MaybePromise<void>
  unmount: () => MaybePromise<void>
}

export interface RegistrationsHandle {
  /** The latest value the adapter returned. */
  list: () => Array<HotkeyRegistrationView>
  /** The count the view rendered. */
  rendered: () => number
  unmount: () => MaybePromise<void>
}

export interface RecorderSpec {
  options: HotkeyRecorderOptions
  provider?: ConformanceProvider
}

export interface RecorderState {
  isRecording: boolean
  steps: HotkeySequence
  recordedHotkey: Hotkey | null
}

export interface RecorderHandle {
  state: () => RecorderState
  start: () => MaybePromise<void>
  stop: () => MaybePromise<void>
  cancel: () => MaybePromise<void>
  commit: () => MaybePromise<void>
  unmount: () => MaybePromise<void>
}

export interface HintSpec {
  hotkey: RegisterableHotkey | null | undefined
  options?: HeldModifierOptions
}

export interface HintHandle {
  value: () => boolean
  setHotkey: (
    hotkey: RegisterableHotkey | null | undefined,
  ) => MaybePromise<void>
  unmount: () => MaybePromise<void>
}

export interface FormatSpec {
  /** The provider platform. Omit for no provider. */
  platform?: HotkeyPlatform
}

export interface FormatHandle {
  /** The label, or labels for a sequence, from the adapter's format function. */
  format: (hotkey: DisplayHotkey, options?: FormatDisplayOptions) => unknown
  unmount: () => MaybePromise<void>
}

/**
 * Mounts adapter views for the shared cases. Each `mount*` renders a view
 * and waits until it has settled. A harness unmounts whatever is still
 * mounted in `cleanup`.
 */
export interface ConformanceHarness {
  name: string
  unsupported?: Partial<Record<ConformanceFeature, string>>
  /** Case keys mapped to the GitHub issue they fail for, such as `'#123'`. */
  knownBugs?: Record<string, string>
  /** Runs a change, such as a key event, and waits for the adapter to settle. */
  act: (change: () => unknown) => MaybePromise<void>
  /** Runs before each case, after core singletons reset. */
  setup?: () => MaybePromise<void>
  /** Runs after each case. Unmounts every view that is still mounted. */
  cleanup: () => MaybePromise<void>
  mountHeldKeys: (watch: IndividualKey) => MaybePromise<HeldKeysHandle>
  mountRegistrations: () => MaybePromise<RegistrationsHandle>
  mountHotkeys: (spec: HotkeysSpec) => MaybePromise<HotkeysHandle>
  mountRecorder?: (spec: RecorderSpec) => MaybePromise<RecorderHandle>
  mountHint?: (spec: HintSpec) => MaybePromise<HintHandle>
  mountFormat?: (spec: FormatSpec) => MaybePromise<FormatHandle>
}
