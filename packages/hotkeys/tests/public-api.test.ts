import { expect, expectTypeOf, it } from 'vitest'
import * as hotkeys from '../src'
import type {
  KeyboardEventMatch,
  NormalizedKeyboardEvent,
  NonPunctuationKey,
  SingleModifierHotkeyChord,
  DisplayHotkey,
  MultiHotkeyChordHandler,
  HotkeySequenceRegistration,
  Target,
} from '../src'

it('exports shared types without exposing internal runtime helpers', () => {
  expectTypeOf<KeyboardEventMatch['score']>().toEqualTypeOf<0 | 1 | 2 | 3>()
  expectTypeOf<NormalizedKeyboardEvent['code']>().toBeString()
  expectTypeOf<'F24'>().toExtend<NonPunctuationKey>()
  expectTypeOf<'Mod+[KeyS]'>().toExtend<SingleModifierHotkeyChord>()
  expectTypeOf<'Mod+[KeyS]'>().toExtend<DisplayHotkey>()
  expectTypeOf<{}>().toExtend<MultiHotkeyChordHandler>()
  expectTypeOf<HotkeySequenceRegistration['target']>().toEqualTypeOf<Target>()
  for (const name of [
    'chordRejection',
    'matchKeyboardEvent',
    'normalizeKeyboardEvent',
    'beginRecording',
    'hotkeyChordFromKeydown',
    'isInputElement',
    'optionsEqual',
    'parseRegisterableHotkey',
    'rawHotkeyToParsedHotkey',
    'normalizeRegisterableHotkey',
    'normalizeHotkeyFromParsed',
    'normalizeHotkeyFromEvent',
    'createHotkeyHandler',
    'createMultiHotkeyHandler',
  ])
    expect(hotkeys).not.toHaveProperty(name)
  expect(hotkeys.matchesKeyboardEvent).toBeTypeOf('function')
  expect(hotkeys.parseHotkey).toBeTypeOf('function')
  expect(hotkeys.areHotkeysEqual).toBeTypeOf('function')
})
