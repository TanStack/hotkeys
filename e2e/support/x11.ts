// Real key presses for the keyboard layout tests. Runs xdotool and setxkbmap
// on the X display the browsers use: locally on Linux (DISPLAY must be set),
// or inside the Docker container named by E2E_X11_CONTAINER.
import { execFileSync, spawn } from 'node:child_process'

const container = process.env.E2E_X11_CONTAINER

function x11(command: string, ...args: Array<string>): string {
  const [file, argv] = container
    ? ['docker', ['exec', container, command, ...args]]
    : [command, args]
  return execFileSync(file, argv, {
    encoding: 'utf8',
    stdio: 'pipe',
    // Fail the test instead of hanging it, such as on a window that never opens.
    timeout: 15_000,
  })
}

/**
 * X11 keycodes, named by physical position (KeyboardEvent.code names, plus
 * AltGr for the right Alt key). The active layout decides what each types.
 */
export const KEYCODES = {
  AltGr: 108,
  Escape: 9,
  Control: 37,
  Alt: 64,
  Shift: 50,
  Backquote: 49,
  Digit1: 10,
  Digit2: 11,
  Digit7: 16,
  KeyA: 38,
  KeyH: 43,
  KeyI: 31,
  KeyE: 26,
  KeyF: 41,
  KeyG: 42,
  KeyK: 45,
  KeyN: 57,
  KeyO: 32,
  KeyQ: 24,
  KeyS: 39,
  KeyY: 29,
  KeyZ: 52,
  Slash: 61,
  Numpad1: 87,
  Home: 110,
  End: 115,
  Space: 65,
  // Keys for the extra layout cases (more-layouts.spec.ts)
  NumLock: 77,
  Digit3: 12,
  Digit4: 13,
  KeyC: 54,
  Quote: 48,
  Semicolon: 47,
  Backslash: 51,
  BracketLeft: 34,
  IntlBackslash: 94,
  IntlRo: 97,
  IntlYen: 132,
  Numpad5: 84,
  Numpad8: 80,
  NumpadDecimal: 91,
  Enter: 36,
  Backspace: 22,
} as const

/**
 * Switches the keyboard layout, such as `('no')` or `('us', 'dvorak')`. A
 * list such as `'ru,us'` makes one group per layout with the first active.
 * xdotool resets the xkb group on each press, so the layout under test goes
 * first.
 */
export function setLayout(layout: string, variant?: string): void {
  x11('setxkbmap', layout, ...(variant ? ['-variant', variant] : []))
}

function keycodes(combo: string): Array<string> {
  return combo.split('+').map((name) => {
    const code = (KEYCODES as Partial<Record<string, number>>)[name]
    if (code === undefined) throw new Error(`No keycode for ${name}`)
    // xdotool reads a single digit as a keysym, so `9` would type "9". Keycode
    // 9 is Escape on every xkb layout, so send the keysym name instead.
    return code < 10 ? name : String(code)
  })
}

/** Holds each key down in order, then releases them in reverse order: `'AltGr+KeyF'`. */
export function press(combo: string): void {
  const codes = keycodes(combo)
  x11(
    'xdotool',
    ...codes.flatMap((code) => ['keydown', code]),
    ...codes.toReversed().flatMap((code) => ['keyup', code]),
  )
}

/** Presses each key down in order and leaves them held. */
export function keyDown(combo: string): void {
  x11('xdotool', ...keycodes(combo).flatMap((code) => ['keydown', code]))
}

/** Releases each key in reverse order. */
export function keyUp(combo: string): void {
  x11(
    'xdotool',
    ...keycodes(combo)
      .toReversed()
      .flatMap((code) => ['keyup', code]),
  )
}

/**
 * Sets the X server's key auto-repeat: the delay before the first repeat and
 * the repeats per second, or `'off'`. Call `resetAutoRepeat` afterwards.
 */
export function setAutoRepeat(
  setting: { delayMs: number; perSecond: number } | 'off',
): void {
  if (setting === 'off') x11('xset', 'r', 'off')
  else {
    x11('xset', 'r', 'on')
    x11('xset', 'r', 'rate', String(setting.delayMs), String(setting.perSecond))
  }
}

/** Restores the X server's default auto-repeat. */
export function resetAutoRepeat(): void {
  x11('xset', 'r', 'on')
  x11('xset', 'r', 'rate')
}

/** Gives keyboard focus to an X window and waits until it has it. */
export function focusWindow(id: string): void {
  x11('xdotool', 'windowfocus', '--sync', id)
}

/**
 * Opens a small xterm in the bottom-right corner, away from the browser
 * window, and returns its X window id and a function that closes it.
 * Closing the window that has keyboard focus returns focus to the root
 * window, so keys go to the window under the pointer again.
 */
export function openOtherWindow(): { id: string; close: () => void } {
  // A unique class finds this window. xterm runs sleep, not a shell, so
  // nothing types into it or changes it.
  const windowClass = `HotkeysE2eOther${process.pid}x${Date.now()}`
  const args = [
    ...['-class', windowClass, '-geometry', '20x4-0-0'],
    ...['-e', 'sleep', 'infinity'],
  ]
  const child = container
    ? spawn('docker', ['exec', container, 'xterm', ...args], {
        stdio: 'ignore',
      })
    : spawn('xterm', args, { stdio: 'ignore' })
  // X refuses to focus a window that is not on screen yet, so wait until the
  // window is visible, not only until it exists.
  const id = x11(
    'xdotool',
    ...['search', '--sync', '--onlyvisible', '--class', windowClass],
  )
    .trim()
    .split('\n')[0]!
  return {
    id,
    close: () => {
      x11('xdotool', 'windowkill', id)
      child.kill()
    },
  }
}

/** Without a window manager, X11 keyboard focus follows the pointer. */
export function focusBrowserWindow(): void {
  x11('xdotool', 'mousemove', '400', '300', 'click', '1')
}
