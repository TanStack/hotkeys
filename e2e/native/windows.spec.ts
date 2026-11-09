// Real Windows key input through SendInput, under US, German and Polish
// (Programmers) layouts. Windows treats AltGr as Control+Alt and lets Left
// Control + Left Alt type AltGr characters, so these cases check what browsers
// report for both (FEAT-060 L-08 and L-09) and that matching follows
// docs/guides/sensible-defaults.md. The report lists each event shape.
import { expect, useNativeInput } from '../support/native'
import { windowsKeyboard } from '../support/native-windows'
import type { NativePress } from '../support/native'

const test = useNativeInput('windows', windowsKeyboard)

const BINDINGS = [
  'F',
  'Alt+F',
  'Control+Alt+F',
  'Control+Alt+[KeyF]',
  'Q',
  '@',
  'Control+Alt+Q',
  'Control+Alt+[KeyQ]',
  'E',
  '€',
  'Control+Alt+E',
  'A',
  'ą',
  'Control+Alt+A',
  'Control+Alt+[KeyA]',
  'Y',
  'Z',
  'Home',
  'Control+Alt+Home',
]

/** Registered with the HotkeyManager to check dispatch end to end. */
const REGISTERED = [
  'Alt+F',
  'Control+Alt+F',
  '@',
  'Control+Alt+Q',
  '€',
  'Control+Alt+E',
  'ą',
  'Control+Alt+A',
  'Control+Alt+Home',
]

function describe(result: NativePress): string {
  const { keydown } = result
  return keydown
    ? `key=${JSON.stringify(keydown.key)} code=${keydown.code} ctrl=${keydown.ctrlKey} alt=${keydown.altKey} altGraph=${keydown.altGraph}`
    : 'no keydown'
}

test.describe('US layout', () => {
  test('Left Control + Left Alt + F is Control+Alt+F', async ({ session }) => {
    const keys = await session({
      bindings: BINDINGS,
      registered: REGISTERED,
      layout: 'us',
    })
    const result = await keys.press('Control+Alt+KeyF')
    expect(result.keydown?.key, describe(result)).toBe('f')
    expect(result.matches, describe(result)).toContain('Control+Alt+F')
    expect(result.matches, describe(result)).toContain('Control+Alt+[KeyF]')
    expect(result.fired, describe(result)).toEqual(['Control+Alt+F'])
  })

  test('right Alt is plain Alt on US', async ({ session }) => {
    const keys = await session({
      bindings: BINDINGS,
      registered: REGISTERED,
      layout: 'us',
    })
    const result = await keys.press('AltGr+KeyF')
    expect(result.keydown?.ctrlKey, describe(result)).toBe(false)
    expect(result.fired, describe(result)).toEqual(['Alt+F'])
  })
})

test.describe('German layout', () => {
  test('the layout is active: KeyY types z', async ({ session }) => {
    const keys = await session({ bindings: BINDINGS, layout: 'de' })
    const result = await keys.press('KeyY')
    expect(result.keydown?.key).toBe('z')
    expect(result.matches).toEqual(['Z'])
  })

  test('AltGr+Q types @ and never fires Control+Alt+Q (L-08)', async ({
    session,
  }) => {
    const keys = await session({
      bindings: BINDINGS,
      registered: REGISTERED,
      layout: 'de',
    })
    const result = await keys.press('AltGr+KeyQ')
    expect(result.keydown?.key, describe(result)).toBe('@')
    expect(result.matches, describe(result)).toEqual(['@'])
    expect(result.fired, describe(result)).toEqual(['@'])
  })

  test('Left Control + Left Alt + Q types @ and never fires Control+Alt+Q (L-09)', async ({
    session,
  }) => {
    const keys = await session({
      bindings: BINDINGS,
      registered: REGISTERED,
      layout: 'de',
    })
    const result = await keys.press('Control+Alt+KeyQ')
    expect(result.keydown?.key, describe(result)).toBe('@')
    expect(result.matches, describe(result)).not.toContain('Control+Alt+Q')
    expect(result.matches, describe(result)).not.toContain('Control+Alt+[KeyQ]')
    expect(result.fired, describe(result)).not.toContain('Control+Alt+Q')
  })

  test('AltGr+E types € and fires only €', async ({ session }) => {
    const keys = await session({
      bindings: BINDINGS,
      registered: REGISTERED,
      layout: 'de',
    })
    const result = await keys.press('AltGr+KeyE')
    expect(result.keydown?.key, describe(result)).toBe('€')
    expect(result.matches, describe(result)).toEqual(['€'])
    expect(result.fired, describe(result)).toEqual(['€'])
  })

  // The docs say German Ctrl+Alt+E fires Control+Alt+E when the browser
  // reports plain Control+Alt. With AltGraph reported, it types € like AltGr.
  test('Left Control + Left Alt + E follows the AltGraph state', async ({
    session,
  }) => {
    const keys = await session({
      bindings: BINDINGS,
      registered: REGISTERED,
      layout: 'de',
    })
    const result = await keys.press('Control+Alt+KeyE')
    expect(result.keydown?.key, describe(result)).toBe('€')
    expect(result.fired, describe(result)).toEqual(
      result.keydown?.altGraph ? ['€'] : ['Control+Alt+E'],
    )
  })

  test('AltGr+F types nothing new and fires Control+Alt+F', async ({
    session,
  }) => {
    const keys = await session({
      bindings: BINDINGS,
      registered: REGISTERED,
      layout: 'de',
    })
    const result = await keys.press('AltGr+KeyF')
    expect(result.keydown?.key, describe(result)).toBe('f')
    expect(result.matches, describe(result)).toEqual([
      'Control+Alt+F',
      'Control+Alt+[KeyF]',
    ])
    expect(result.fired, describe(result)).toEqual(['Control+Alt+F'])
  })

  test('AltGr+Home fires Control+Alt+Home', async ({ session }) => {
    const keys = await session({
      bindings: BINDINGS,
      registered: REGISTERED,
      layout: 'de',
    })
    const result = await keys.press('AltGr+Home')
    expect(result.keydown?.key, describe(result)).toBe('Home')
    expect(result.matches, describe(result)).toEqual(['Control+Alt+Home'])
    expect(result.fired, describe(result)).toEqual(['Control+Alt+Home'])
  })
})

test.describe('Polish (Programmers) layout', () => {
  test('AltGr+A types ą and never fires Control+Alt+A (L-08)', async ({
    session,
  }) => {
    const keys = await session({
      bindings: BINDINGS,
      registered: REGISTERED,
      layout: 'pl',
    })
    const result = await keys.press('AltGr+KeyA')
    expect(result.keydown?.key, describe(result)).toBe('ą')
    expect(result.matches, describe(result)).toEqual(['ą'])
    expect(result.fired, describe(result)).toEqual(['ą'])
  })

  test('Left Control + Left Alt + A types ą and never fires Control+Alt+A (L-09)', async ({
    session,
  }) => {
    const keys = await session({
      bindings: BINDINGS,
      registered: REGISTERED,
      layout: 'pl',
    })
    const result = await keys.press('Control+Alt+KeyA')
    expect(result.keydown?.key, describe(result)).toBe('ą')
    expect(result.matches, describe(result)).not.toContain('Control+Alt+A')
    expect(result.matches, describe(result)).not.toContain('Control+Alt+[KeyA]')
    expect(result.fired, describe(result)).not.toContain('Control+Alt+A')
  })
})
