// Real key input on Wayland: browsers run with the Wayland backend under
// headless sway, and keys come from a virtual keyboard with a real xkb keymap.
// Chrome on Wayland can report `key: 'Unidentified'` with a usable `code`
// (#229, fixed in #232). The report lists each event shape.
import { expect, useNativeInput } from '../support/native'
import { waylandKeyboard } from '../support/native-wayland'
import type { NativePress } from '../support/native'

const test = useNativeInput('wayland', waylandKeyboard)

const BINDINGS = [
  'Control+`',
  'Control+[Backquote]',
  'Mod+S',
  'Control+[KeyS]',
  'S',
  '[KeyS]',
  '!',
  'Shift+1',
  'Alt+F',
  'Escape',
  'Q',
  '@',
  'Control+Alt+Q',
  'Mod+Y',
  'Mod+Z',
  'Z',
]

function describe(result: NativePress): string {
  const { keydown } = result
  return keydown
    ? `key=${JSON.stringify(keydown.key)} code=${keydown.code} keyCode=${keydown.keyCode} ctrl=${keydown.ctrlKey} alt=${keydown.altKey} altGraph=${keydown.altGraph} isComposing=${keydown.isComposing}`
    : 'no keydown'
}

test.describe('US layout', () => {
  test('Control+Backquote matches logical and physical bindings (#229)', async ({
    session,
  }) => {
    const keys = await session({
      bindings: BINDINGS,
      registered: ['Control+`'],
      layout: 'us',
    })
    const result = await keys.press('Control+Backquote')
    expect(result.keydown?.code, describe(result)).toBe('Backquote')
    expect(result.matches, describe(result)).toEqual([
      'Control+`',
      'Control+[Backquote]',
    ])
    expect(result.fired, describe(result)).toEqual(['Control+`'])
  })

  test('Control+S matches Mod+S and Control+[KeyS]', async ({ session }) => {
    // The physical binding keeps the browser's Save dialog closed when the
    // logical one can't match.
    const keys = await session({
      bindings: BINDINGS,
      registered: ['Mod+S', 'Control+[KeyS]'],
      layout: 'us',
    })
    const result = await keys.press('Control+KeyS')
    expect(result.keydown?.code, describe(result)).toBe('KeyS')
    // A letter that arrives as `Unidentified` only matches physical bindings,
    // by design (#232): its position can't name a letter on every layout.
    expect(result.matches, describe(result)).toEqual(
      result.keydown?.key === 'Unidentified'
        ? ['Control+[KeyS]']
        : ['Mod+S', 'Control+[KeyS]'],
    )
    expect(result.fired.toSorted(), describe(result)).toEqual(
      result.keydown?.key === 'Unidentified'
        ? ['Control+[KeyS]']
        : ['Control+[KeyS]', 'Mod+S'],
    )
  })

  test('S types s and matches S and [KeyS]', async ({ session }) => {
    const keys = await session({ bindings: BINDINGS, layout: 'us' })
    const result = await keys.press('KeyS')
    expect(result.keydown?.key, describe(result)).toBe('s')
    expect(result.matches, describe(result)).toEqual(['S', '[KeyS]'])
  })

  test('Shift+1 types ! and matches ! and Shift+1', async ({ session }) => {
    const keys = await session({ bindings: BINDINGS, layout: 'us' })
    const result = await keys.press('Shift+Digit1')
    expect(result.keydown?.key, describe(result)).toBe('!')
    expect(result.matches, describe(result)).toEqual(['!', 'Shift+1'])
  })

  test('Alt+F fires Alt+F', async ({ session }) => {
    const keys = await session({
      bindings: BINDINGS,
      registered: ['Alt+F'],
      layout: 'us',
    })
    const result = await keys.press('Alt+KeyF')
    expect(result.matches, describe(result)).toEqual(['Alt+F'])
    expect(result.fired, describe(result)).toEqual(['Alt+F'])
  })
})

test.describe('German layout', () => {
  test('KeyY types z, and Control on it fires Mod+Z', async ({ session }) => {
    const keys = await session({
      bindings: BINDINGS,
      registered: ['Mod+Y'],
      layout: 'de',
    })
    const plain = await keys.press('KeyY')
    expect(plain.keydown?.key, describe(plain)).toBe('z')
    expect(plain.matches, describe(plain)).toEqual(['Z'])
    const control = await keys.press('Control+KeyZ')
    expect(control.keydown?.code, describe(control)).toBe('KeyZ')
    if (control.keydown?.key !== 'Unidentified') {
      expect(control.matches, describe(control)).toEqual(['Mod+Y'])
      expect(control.fired, describe(control)).toEqual(['Mod+Y'])
    }
  })

  test('AltGr+Q types @ and never fires Control+Alt+Q', async ({ session }) => {
    const keys = await session({
      bindings: BINDINGS,
      registered: ['@', 'Control+Alt+Q'],
      layout: 'de',
    })
    const result = await keys.press('AltGr+KeyQ')
    expect(result.keydown?.key, describe(result)).toBe('@')
    expect(result.matches, describe(result)).toEqual(['@'])
    expect(result.fired, describe(result)).toEqual(['@'])
  })
})
