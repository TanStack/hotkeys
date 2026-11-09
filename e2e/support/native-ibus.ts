// X11 driver with an ibus input method for the nightly suite. Keys go through
// xdotool, as in the layout suite. `setLayout` switches the ibus engine, such
// as `libpinyin` (Chinese) or `xkb:us::eng` (no input method).
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
      // `ibus engine libpinyin` switches the engine, then exits 1 with no
      // message (Ubuntu 24.04, ibus 1.5.29). Trust the engine read back, not
      // the exit code. The first switch also starts the engine's process.
      let active = ''
      for (let attempt = 0; attempt < 20 && active !== engine; attempt++) {
        try {
          ibus('engine', engine)
        } catch {}
        active = ibus('engine')
        if (active !== engine) await sleep(250)
      }
      if (active !== engine) {
        throw new Error(`ibus engine is ${active}, not ${engine}`)
      }
      // The browser's input context picks up the engine change asynchronously.
      await sleep(300)
    },
    press: (combo) => press(combo),
    close: () => {},
  }
}
