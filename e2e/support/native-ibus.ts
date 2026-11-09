// X11 driver with an ibus input method for the nightly suite. Keys go through
// xdotool, as in the layout suite. `setLayout` switches the ibus engine, such
// as `anthy` (Japanese) or `xkb:us::eng` (no input method).
// native/ibus/run.sh starts the ibus daemon.
import { execFileSync } from 'node:child_process'
import { focusBrowserWindow, press } from './x11'
import type { NativeKeyboard } from './native'

function ibus(...args: Array<string>): string {
  try {
    return execFileSync('ibus', args, {
      encoding: 'utf8',
      stdio: 'pipe',
    }).trim()
  } catch (error) {
    const { stdout, stderr } = error as { stdout?: string; stderr?: string }
    throw new Error(
      `ibus ${args.join(' ')} failed: ${`${stdout ?? ''} ${stderr ?? ''}`.trim()}`,
    )
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function ibusKeyboard(): NativeKeyboard {
  return {
    focus: () => focusBrowserWindow(),
    setLayout: async (engine) => {
      // An engine's first switch starts its process and can time out.
      for (let attempt = 1; ; attempt++) {
        try {
          ibus('engine', engine)
          if (ibus('engine') === engine) break
        } catch (error) {
          if (attempt === 10) throw error
        }
        await sleep(500)
      }
      // The browser's input context picks up the engine change asynchronously.
      await sleep(300)
    },
    press: (combo) => press(combo),
    close: () => {},
  }
}
