import { expectTypeOf, it } from 'vitest'
import type {
  Hotkey,
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
    | '[ShiftRight]'
    | '[F24]'
    | '[AudioVolumeUp]'
  >().toExtend<PhysicalKey>()
  expectTypeOf<
    'Mod+[KeyS]' | 'Control+Alt+Shift+Meta+[Enter]'
  >().toExtend<Hotkey>()
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
    | '[F25]'
    | '[Unidentified]'
    | '[]'
    | 'KeyS'
  expectTypeOf<Extract<InvalidToken, PhysicalKey>>().toBeNever()
  expectTypeOf<Extract<`Mod+${InvalidToken}`, Hotkey>>().toBeNever()
  expectTypeOf<Extract<`Mod+${InvalidToken}`, RegisterableHotkey>>().toBeNever()
  expectTypeOf<string>().not.toExtend<PhysicalKeyCode>()
  expectTypeOf<`[${string}]`>().not.toExtend<PhysicalKey>()
})
