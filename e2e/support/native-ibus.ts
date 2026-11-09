// X11 driver with an ibus input method for the nightly suite. Keys go through
// xdotool, as in the layout suite. `setLayout` switches the ibus engine, such
// as `anthy` (Japanese) or `xkb:us::eng` (no input method).
// native/ibus/run.sh starts the ibus daemon.
import { execFileSync } from 'node:child_process'
import { focusBrowserWindow, press } from './x11'
import type { NativeKeyboard } from './native'

function ibus(...args: Array<string>): string {
  return execFileSync('ibus', args, { encoding: 'utf8', stdio: 'pipe' }).trim()
}

export function ibusKeyboard(): NativeKeyboard {
  return {
    focus: () => focusBrowserWindow(),
    setLayout: async (engine) => {
      ibus('engine', engine)
      const active = ibus('engine')
      if (active !== engine) {
        throw new Error(`ibus engine is ${active}, not ${engine}`)
      }
      // The browser's input context picks up the engine change asynchronously.
      await new Promise((resolve) => setTimeout(resolve, 300))
    },
    press: (combo) => press(combo),
    close: () => {},
  }
}
