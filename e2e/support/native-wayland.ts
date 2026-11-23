// Wayland driver for the nightly suite. Runs the virtual keyboard client
// (native/wayland/vkbd.c, built by native/wayland/run.sh) against the
// compositor in WAYLAND_DISPLAY.
import { fileURLToPath } from 'node:url'
import { lineProcess } from './native'
import { KEYCODES } from './x11'
import type { NativeKeyboard } from './native'

const VKBD =
  process.env.E2E_VKBD ??
  fileURLToPath(new URL('../.cache/vkbd', import.meta.url))

/** evdev key codes are X11 key codes minus 8. */
function evdevCode(name: string): number {
  const code = (KEYCODES as Partial<Record<string, number>>)[name]
  if (code === undefined) throw new Error(`No keycode for ${name}`)
  return code - 8
}

export async function waylandKeyboard(): Promise<NativeKeyboard> {
  const helper = lineProcess(VKBD)
  await helper.send('layout us')

  return {
    // The compositor focuses the browser's only window.
    focus: async (page) => {
      await page.bringToFront()
    },
    setLayout: async (layout) => {
      const [, name, variant] = layout.match(/^([^(]+)(?:\((.+)\))?$/) ?? []
      await helper.send(`layout ${name} ${variant ?? ''}`.trim())
      // Browsers apply a new keymap when it arrives, before the next key.
      await new Promise((resolve) => setTimeout(resolve, 200))
    },
    press: async (combo) => {
      const codes = combo.split('+').map(evdevCode)
      for (const code of codes) await helper.send(`down ${code}`)
      for (const code of codes.toReversed()) await helper.send(`up ${code}`)
    },
    close: helper.close,
  }
}
