// Shared by every adapter fixture app. Each app renders the same small UI with
// its adapter and calls `exposeFixture` so the specs can drive it the same way.
//
// The UI each app renders:
// - a component, shown by default, that registers `fixture.hotkey` (default
//   `K`) with `enabled` (default true) and calls `logCall('hotkey')`; it
//   renders `#hotkey-host` while mounted
// - a `['G', 'G']` sequence that calls `logCall('sequence')`
// - a chord recorder whose `onRecord` calls `setRecorded`; `#recording`
//   shows `yes` while it records and `no` otherwise
// - `#shift-held` showing `held` or `released` from the adapter's key hold
// - `#held-keys` showing the adapter's held keys joined with `+`

/** What an app passes to `exposeFixture`. Each call updates framework state. */
export interface FixtureControls {
  setShown: (shown: boolean) => void
  setEnabled: (enabled: boolean) => void
  setHotkey: (hotkey: string) => void
  startRecording: () => void
}

/** A registration as the specs see it. */
export interface FixtureRegistration {
  hotkey: string
  enabled: boolean
}

export interface Fixture extends FixtureControls {
  /** Names passed to `logCall`, in order. */
  log: Array<string>
  /** The last hotkey the recorder recorded. */
  recorded: unknown
  /** The hotkey manager's registrations, with sequences joined by spaces. */
  registrations: () => Array<FixtureRegistration>
  /** The key `Mod` resolves to in this page. */
  mod: 'Meta' | 'Control'
}

/** The core exports each adapter re-exports. */
export interface CoreExports {
  getHotkeyManager: () => unknown
  detectPlatform: () => string
}

interface ManagerLike {
  registrations: {
    state: Map<
      string,
      { hotkey: string | Array<string>; options: { enabled?: boolean } }
    >
  }
}

declare global {
  interface Window {
    fixture?: Fixture
    fixtureLog?: Array<string>
    fixtureRecorded?: unknown
  }
}

const log: Array<string> = (window.fixtureLog = [])

export function logCall(name: string): void {
  log.push(name)
}

export function setRecorded(hotkey: unknown): void {
  window.fixtureRecorded = hotkey
}

/**
 * Publishes the controls on `window.fixture`. Call it once the app has
 * mounted. Pass the adapter's own re-exports of the core, so the specs read
 * the manager instance the adapter registers with.
 */
export function exposeFixture(
  core: CoreExports,
  controls: FixtureControls,
): void {
  window.fixture = {
    ...controls,
    log,
    mod: core.detectPlatform() === 'mac' ? 'Meta' : 'Control',
    get recorded() {
      return window.fixtureRecorded
    },
    registrations: () =>
      [...(core.getHotkeyManager() as ManagerLike).registrations.state.values()].map(
        (registration) => ({
          hotkey: Array.isArray(registration.hotkey)
            ? registration.hotkey.join(' ')
            : registration.hotkey,
          enabled: registration.options.enabled !== false,
        }),
      ),
  }
}
