import { expect, it } from 'vitest'
import { matchesHeldModifiers } from '../src/hint'

it('matches nonempty modifier subsets with exact and platform options', () => {
  expect(matchesHeldModifiers('Alt+Shift+[KeyK]', ['Alt', 'x'])).toBe(true)
  expect(
    matchesHeldModifiers('Alt+Shift+[KeyK]', ['Alt'], { exact: true }),
  ).toBe(false)
  expect(
    matchesHeldModifiers('Alt+Shift+[KeyK]', ['Alt', 'Shift'], { exact: true }),
  ).toBe(true)
  expect(matchesHeldModifiers('Alt+Shift+[KeyK]', ['Alt', 'Control'])).toBe(
    false,
  )
  expect(matchesHeldModifiers('Alt+[KeyK]', [])).toBe(false)
  expect(
    matchesHeldModifiers('Control+Alt+[KeyK]', ['Control', 'Alt', 'AltGraph']),
  ).toBe(false)
  expect(
    matchesHeldModifiers('Mod+[KeyK]', ['Meta'], { platform: 'mac' }),
  ).toBe(true)
})
