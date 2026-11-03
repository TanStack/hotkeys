import type { FormatDisplayOptions } from '@tanstack/svelte-hotkeys'

/**
 * The format option toggles, with no framework code, so every example can
 * share this file. The first choice of each group is the default, so the
 * server's HTML and the first client render use the same options.
 */
export const optionGroups = [
  {
    id: 'platform',
    label: 'Platform',
    choices: [
      { value: 'default', label: 'Your platform' },
      { value: 'mac', label: 'macOS' },
      { value: 'windows', label: 'Windows' },
      { value: 'linux', label: 'Linux' },
    ],
  },
  {
    id: 'symbols',
    label: 'Symbols',
    choices: [
      { value: 'default', label: 'Default' },
      { value: 'text', label: 'Text labels' },
      { value: 'modifiers', label: 'Modifier symbols only' },
      { value: 'keys', label: 'Key symbols only' },
    ],
  },
  {
    id: 'separator',
    label: 'Separator',
    choices: [
      { value: 'default', label: 'Platform default' },
      { value: 'plus', label: "' + '" },
      { value: 'none', label: 'None' },
    ],
  },
  {
    id: 'display',
    label: 'Display',
    choices: [
      { value: 'text', label: 'Text' },
      { value: 'keycaps', label: 'Keycaps' },
    ],
  },
  {
    id: 'sequenceSeparator',
    label: 'Sequence separator',
    choices: [
      { value: 'space', label: 'Space' },
      { value: 'then', label: "' then '" },
    ],
  },
  {
    id: 'layoutMap',
    label: 'Layout map',
    choices: [
      { value: 'off', label: 'Off' },
      { value: 'sample', label: 'Sample (Q → A)' },
    ],
  },
  {
    id: 'keyLabels',
    label: 'Custom labels',
    choices: [
      { value: 'off', label: 'Off' },
      { value: 'custom', label: 'Esc key, Return' },
    ],
  },
] as const

export type OptionGroup = (typeof optionGroups)[number]
export type OptionId = OptionGroup['id']

/** The selected choice of each group. */
export type FormatChoices = {
  [G in OptionGroup as G['id']]: G['choices'][number]['value']
}

export const defaultChoices: FormatChoices = {
  platform: 'default',
  symbols: 'default',
  separator: 'default',
  display: 'text',
  sequenceSeparator: 'space',
  layoutMap: 'off',
  keyLabels: 'off',
}

/** A sample keyboard layout that types A on the key where Q sits. */
const sampleLayoutMap = new Map([['KeyQ', 'a']])

const customKeyLabels = { Escape: 'Esc key', Enter: 'Return' }

/** Each option as an entry for `formatForDisplay`, plus its source code. */
function toEntries(
  choices: FormatChoices,
): Array<[keyof FormatDisplayOptions, unknown, string]> {
  const entries: Array<[keyof FormatDisplayOptions, unknown, string]> = []
  if (choices.platform !== 'default') {
    entries.push(['platform', choices.platform, `'${choices.platform}'`])
  }
  if (choices.symbols === 'text') {
    entries.push(['useSymbols', false, 'false'])
  } else if (choices.symbols === 'modifiers') {
    entries.push(['useSymbols', { keys: false }, '{ keys: false }'])
  } else if (choices.symbols === 'keys') {
    entries.push(['useSymbols', { modifiers: false }, '{ modifiers: false }'])
  }
  if (choices.separator === 'plus') {
    entries.push(['separatorToken', ' + ', "' + '"])
  } else if (choices.separator === 'none') {
    entries.push(['separatorToken', '', "''"])
  }
  if (choices.display === 'keycaps') {
    entries.push(['parts', true, 'true'])
  }
  if (choices.sequenceSeparator === 'then') {
    entries.push(['sequenceSeparator', ' then ', "' then '"])
  }
  if (choices.layoutMap === 'sample') {
    entries.push(['layoutMap', sampleLayoutMap, "new Map([['KeyQ', 'a']])"])
  }
  if (choices.keyLabels === 'custom') {
    entries.push([
      'keyLabels',
      customKeyLabels,
      "{ Escape: 'Esc key', Enter: 'Return' }",
    ])
  }
  return entries
}

/** The options to pass to the formatter for the selected choices. */
export function toFormatOptions(choices: FormatChoices): FormatDisplayOptions {
  return Object.fromEntries(
    toEntries(choices).map(([key, value]) => [key, value]),
  )
}

/** The formatter call for the selected choices, as code. */
export function toFormatCode(choices: FormatChoices): string {
  const entries = toEntries(choices)
  if (entries.length === 0) return 'format(hotkey)'
  const fields = entries.map(([key, , code]) => `${key}: ${code}`)
  return `format(hotkey, { ${fields.join(', ')} })`
}

const platformNames = { mac: 'macOS', windows: 'Windows', linux: 'Linux' }

export function platformName(platform: 'mac' | 'windows' | 'linux'): string {
  return platformNames[platform]
}
