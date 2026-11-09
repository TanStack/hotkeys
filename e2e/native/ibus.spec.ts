// Real IME composition through ibus under X11. Chinese pinyin (libpinyin)
// shows typed letters as a composition: n, i, h, a, o shows `nihao`, and Space
// commits the first candidate, 你好. Keys the input method uses must never fire hotkeys, and hotkeys must
// work again once composition ends. The report lists each event shape.
import { expect, useNativeInput } from '../support/native'
import { ibusKeyboard } from '../support/native-ibus'
import type {
  NativePress,
  NativeSession,
  NativeSessionOptions,
} from '../support/native'

const test = useNativeInput('ibus', ibusKeyboard)

const ENGINE = process.env.E2E_IBUS_ENGINE ?? 'libpinyin'
const NO_IME = 'xkb:us::eng'

/** The input fills the page, so a click anywhere focuses it. */
const BODY =
  '<input id="field" style="position:fixed;inset:0;width:100%;height:100%;font-size:32px" autocomplete="off">'

// Single keys are ignored in inputs by default. These opt in, so any key the
// input method passes through would fire.
const REGISTERED: Array<[string, { ignoreInputs: false }]> = [
  'N',
  'I',
  'H',
  'A',
  'O',
  'Space',
  'Enter',
  'Escape',
  'Backspace',
].map((binding) => [binding, { ignoreInputs: false }])

const BINDINGS = REGISTERED.map(([binding]) => binding)

function describe(result: NativePress): string {
  return result.events
    .filter(
      (event) => event.type === 'keydown' || event.type.startsWith('comp'),
    )
    .map((event) =>
      event.type === 'keydown'
        ? `keydown key=${JSON.stringify(event.key)} keyCode=${event.keyCode} isComposing=${event.isComposing}`
        : `${event.type} ${JSON.stringify(event.data)}`,
    )
    .join(', ')
}

async function open(
  session: (options: NativeSessionOptions) => Promise<NativeSession>,
) {
  const keys = await session({
    body: BODY,
    bindings: BINDINGS,
    registered: REGISTERED,
    layout: NO_IME,
  })
  await keys.page.focus('#field')
  return keys
}

async function compose(keys: NativeSession, combos: Array<string>) {
  const results: Array<NativePress> = []
  for (const combo of combos) {
    const result = await keys.press(combo)
    expect(result.fired, `${combo}: ${describe(result)}`).toEqual([])
    expect(result.matches, `${combo}: ${describe(result)}`).toEqual([])
    results.push(result)
  }
  return results
}

test('composition keys never fire hotkeys, and hotkeys fire after commit', async ({
  session,
}) => {
  const keys = await open(session)
  await keys.setLayout(ENGINE)

  const typed = await compose(keys, ['KeyN', 'KeyI', 'KeyH', 'KeyA', 'KeyO'])
  expect(
    typed.flatMap((result) => result.events).map((event) => event.type),
    'the input method composed text',
  ).toContain('compositionstart')

  // Space commits the first candidate.
  const [commit] = await compose(keys, ['Space'])
  expect(
    commit!.events.map((event) => event.type),
    describe(commit!),
  ).toContain('compositionend')
  const value = await keys.page.inputValue('#field')
  expect(value, 'committed text').not.toMatch(/^[a-z]*$/i)

  // Nothing is composing, so the input method passes Enter through.
  const enter = await keys.press('Enter')
  expect(enter.fired, describe(enter)).toEqual(['Enter'])

  await keys.setLayout(NO_IME)
  const letter = await keys.press('KeyA')
  expect(letter.fired, describe(letter)).toEqual(['A'])
})

test('Escape and Backspace that edit a composition never fire hotkeys', async ({
  session,
}) => {
  const keys = await open(session)
  await keys.setLayout(ENGINE)

  await compose(keys, ['KeyN', 'KeyI', 'KeyH', 'KeyA', 'KeyO', 'Backspace'])
  // libpinyin takes Escape (keyCode 229) without ending the composition when
  // ibus runs with no panel, so Space commits it instead.
  await compose(keys, ['Escape'])
  const [commit] = await compose(keys, ['Space'])
  expect(
    commit!.events.map((event) => event.type),
    describe(commit!),
  ).toContain('compositionend')
  const escape = await keys.press('Escape')
  expect(escape.fired, describe(escape)).toEqual(['Escape'])
})
