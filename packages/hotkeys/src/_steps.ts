import { parsedChordsEqual } from './_chord'
import { matchesKeyboardEvent } from './match'
import { parseHotkey } from './parse'
import type { RegisterableHotkeyChord } from './hotkey.types'
import type { HotkeyPlatform } from './platform'

/**
 * Whether two hotkeys' steps collide: at every step they share, the chords are
 * equal or the key press that recorded that step fires both. One sequence
 * that starts with the other collides too. Each side resolves `Mod` on its own
 * platform. A step is parsed only when the steps before it collide, so pass
 * raw steps: parsing an already-parsed chord can throw for keys like `[1]`.
 */
export function stepsOverlap(
  left: ReadonlyArray<RegisterableHotkeyChord>,
  right: ReadonlyArray<RegisterableHotkeyChord>,
  platforms: readonly [left: HotkeyPlatform, right: HotkeyPlatform],
  events?: ReadonlyArray<KeyboardEvent>,
): boolean {
  const [leftPlatform, rightPlatform] = platforms
  const length = Math.min(left.length, right.length)
  for (let index = 0; index < length; index++) {
    const a = parseHotkey(left[index]!, leftPlatform)
    const b = parseHotkey(right[index]!, rightPlatform)
    const event = events?.[index]
    if (
      !parsedChordsEqual(a, b) &&
      !(
        event &&
        matchesKeyboardEvent(event, a, leftPlatform) &&
        matchesKeyboardEvent(event, b, rightPlatform)
      )
    ) {
      return false
    }
  }
  return true
}
