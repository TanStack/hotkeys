// Real key presses for the keyboard layout tests. Runs xdotool and setxkbmap
// on the X display the browsers use: locally on Linux (DISPLAY must be set),
// or inside the Docker container named by E2E_X11_CONTAINER.
import { execFileSync } from 'node:child_process'

const container = process.env.E2E_X11_CONTAINER

function x11(command: string, ...args: Array<string>): string {
  const [file, argv] = container
    ? ['docker', ['exec', container, command, ...args]]
    : [command, args]
  return execFileSync(file, argv, { encoding: 'utf8', stdio: 'pipe' })
}

/**
 * X11 keycodes, named by physical position (KeyboardEvent.code names, plus
 * AltGr for the right Alt key). The active layout decides what each types.
 */
const KEYCODES = {
  AltGr: 108,
  Control: 37,
  Alt: 64,
  Shift: 50,
  Backquote: 49,
  Digit1: 10,
  Digit2: 11,
  Digit7: 16,
  KeyA: 38,
  KeyE: 26,
  KeyF: 41,
  KeyK: 45,
  KeyQ: 24,
  KeyS: 39,
  KeyY: 29,
  KeyZ: 52,
  Slash: 61,
  Numpad1: 87,
  Home: 110,
  End: 115,
  Space: 65,
} as const

/** Switches the keyboard layout, such as `('no')` or `('us', 'dvorak')`. */
export function setLayout(layout: string, variant?: string): void {
  x11('setxkbmap', layout, ...(variant ? ['-variant', variant] : []))
}

/** Holds each key down in order, then releases them in reverse order: `'AltGr+KeyF'`. */
export function press(combo: string): void {
  const codes = combo.split('+').map((name) => {
    const code = (KEYCODES as Partial<Record<string, number>>)[name]
    if (code === undefined) throw new Error(`No keycode for ${name}`)
    return String(code)
  })
  x11(
    'xdotool',
    ...codes.flatMap((code) => ['keydown', code]),
    ...codes.toReversed().flatMap((code) => ['keyup', code]),
  )
}

/** Without a window manager, X11 keyboard focus follows the pointer. */
export function focusBrowserWindow(): void {
  x11('xdotool', 'mousemove', '400', '300', 'click', '1')
}
