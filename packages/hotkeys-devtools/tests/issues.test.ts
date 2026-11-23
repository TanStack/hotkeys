import { describe, expect, it } from 'vitest'
import { describeHotkeyIssues } from '../src/_issues'
import type { Hotkey } from '@tanstack/hotkeys'

describe('describeHotkeyIssues', () => {
  it.each([
    ['', ['The hotkey is empty, so it registers nothing.']],
    [
      'Mod++S',
      ['A part between + signs is empty, so the hotkey registers nothing.'],
    ],
    [
      'Hyper+S',
      [
        "'Hyper' isn't a modifier, so the hotkey registers nothing. Use Control, Alt, Shift, Meta, or Mod.",
      ],
    ],
    [
      '[KeyS',
      [
        "'[KeyS' isn't a KeyboardEvent.code. Write physical keys like [KeyS].",
        "'[KeyS' isn't a known key name, so the hotkey may never fire. Key names are case-sensitive, such as Escape and F1.",
      ],
    ],
    [
      'Control+Shift',
      [
        "'Shift' is a modifier, so the hotkey registers nothing. Add a key that isn't a modifier.",
      ],
    ],
    [
      'escape',
      [
        "'escape' isn't a known key name, so the hotkey may never fire. Key names are case-sensitive, such as Escape and F1.",
      ],
    ],
    ['Mod+S', []],
  ])('describes %j', (hotkey, expected) => {
    expect(describeHotkeyIssues(hotkey as Hotkey)).toEqual(expected)
  })

  it('numbers sequence steps from 1 and lists errors before warnings', () => {
    expect(describeHotkeyIssues(['escape', 'Hyper+S'] as never)).toEqual([
      "Step 2: 'Hyper' isn't a modifier, so the hotkey registers nothing. Use Control, Alt, Shift, Meta, or Mod.",
      "Step 1: 'escape' isn't a known key name, so the hotkey may never fire. Key names are case-sensitive, such as Escape and F1.",
    ])
  })

  it('describes an empty sequence', () => {
    expect(describeHotkeyIssues([] as never)).toEqual([
      'The hotkey is empty, so it registers nothing.',
    ])
  })
})
