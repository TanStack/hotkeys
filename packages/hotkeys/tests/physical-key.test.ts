import { expectTypeOf, it } from 'vitest'
import type {
  HotkeyChord,
  PhysicalKey,
  PhysicalKeyCode,
  RegisterableHotkey,
} from '../src'

it('accepts finite physical code families inside brackets', () => {
  expectTypeOf<
    | '[KeyA]'
    | '[KeyZ]'
    | '[Digit0]'
    | '[Digit9]'
    | '[Numpad0]'
    | '[NumpadEnter]'
    | '[Enter]'
    | '[IntlBackslash]'
    | '[F24]'
    | '[AudioVolumeUp]'
  >().toExtend<PhysicalKey>()
  expectTypeOf<
    'Mod+[KeyS]' | 'Control+Alt+Shift+Meta+[Enter]'
  >().toExtend<HotkeyChord>()
  expectTypeOf<'Mod+[Digit1]'>().toExtend<RegisterableHotkey>()
})

it('rejects misspelled, unbracketed, and unidentified physical tokens', () => {
  type InvalidToken =
    | '[KeyBanana]'
    | '[Keya]'
    | '[Digit10]'
    | '[Numpad10]'
    | '[NumpadPlus]'
    | '[ControlMiddle]'
    | '[ShiftRight]'
    | '[MetaLeft]'
    | '[F25]'
    | '[Unidentified]'
    | '[]'
    | 'KeyS'
  expectTypeOf<Extract<InvalidToken, PhysicalKey>>().toBeNever()
  expectTypeOf<Extract<`Mod+${InvalidToken}`, HotkeyChord>>().toBeNever()
  expectTypeOf<Extract<`Mod+${InvalidToken}`, RegisterableHotkey>>().toBeNever()
  expectTypeOf<string>().not.toExtend<PhysicalKeyCode>()
  expectTypeOf<`[${string}]`>().not.toExtend<PhysicalKey>()
})

it('rejects modifier-only hotkeys', () => {
  type ModifierOnly =
    | 'Shift'
    | 'Mod'
    | 'Shift+Alt+Mod'
    | '[ShiftLeft]'
    | 'Shift+[ShiftLeft]'
    | 'Mod+[MetaRight]'
  expectTypeOf<Extract<ModifierOnly, HotkeyChord>>().toBeNever()
  expectTypeOf<Extract<ModifierOnly, RegisterableHotkey>>().toBeNever()
})
