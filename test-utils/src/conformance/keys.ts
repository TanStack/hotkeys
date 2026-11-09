import { detectPlatform } from '@tanstack/hotkeys'
import type { KeyOptions } from '../events'

/**
 * Whether Mod is Meta where the suite runs. The Vitest setup pins the user
 * agent to `HOTKEYS_TEST_PLATFORM`; Ember runs in a real browser.
 */
const isMac = () => detectPlatform() === 'mac'

/** A letter pressed with Mod (Meta on Mac, Control elsewhere). */
export function mod(key: string, extra: Partial<KeyOptions> = {}): KeyOptions {
  const code = `Key${key.toUpperCase()}`
  return isMac()
    ? { key, code, metaKey: true, ...extra }
    : { key, code, ctrlKey: true, ...extra }
}

/** The Mod key itself, pressed. */
export function modDown(): KeyOptions {
  return isMac()
    ? { key: 'Meta', code: 'MetaLeft', metaKey: true }
    : { key: 'Control', code: 'ControlLeft', ctrlKey: true }
}

/** The Mod key itself, released. */
export function modUp(): KeyOptions {
  return isMac()
    ? { key: 'Meta', code: 'MetaLeft' }
    : { key: 'Control', code: 'ControlLeft' }
}
