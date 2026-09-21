import { expect, expectTypeOf, it } from 'vitest'
import * as hotkeys from '../src'
import type {
  KeyboardEventMatch,
  NormalizedKeyboardEvent,
  NonPunctuationKey,
  SingleModifierHotkey,
  DisplayHotkey,
  MultiHotkeyHandler,
  SequenceRegistration,
  Target,
} from '../src'

it('exports shared types without exposing internal runtime helpers', () => {
  expectTypeOf<KeyboardEventMatch['score']>().toEqualTypeOf<0 | 1 | 2 | 3>()
  expectTypeOf<NormalizedKeyboardEvent['code']>().toBeString()
  expectTypeOf<'F24'>().toExtend<NonPunctuationKey>()
  expectTypeOf<'Mod+[KeyS]'>().toExtend<SingleModifierHotkey>()
  expectTypeOf<'Mod+[KeyS]'>().toExtend<DisplayHotkey>()
  expectTypeOf<{}>().toExtend<MultiHotkeyHandler>()
  expectTypeOf<SequenceRegistration['target']>().toEqualTypeOf<Target>()
  for (const name of [
    'chordRejection',
    'matchKeyboardEvent',
    'normalizeKeyboardEvent',
    'beginRecording',
    'hotkeyChordFromKeydown',
    'isInputElement',
    'optionsEqual',
  ])
    expect(hotkeys).not.toHaveProperty(name)
  expect(hotkeys.matchesKeyboardEvent).toBeTypeOf('function')
  expect(hotkeys.parseRegisterableHotkey).toBeTypeOf('function')
  expect(hotkeys.areHotkeysEqual).toBeTypeOf('function')
})
