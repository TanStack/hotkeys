// Builds packages/hotkeys/tests/fixtures/layout-table.json: what each key
// position types on real keyboard layouts, per platform and modifier level.
// The invariant tests build their keyboard events from it.
//
//   pnpm generate:layout-table <sources-dir>
//
// <sources-dir> holds the raw data, which is not committed:
// - xkb.txt and keysymdef.h, from dump-xkb.sh (Linux, xkeyboard-config)
// - windows-cldr43/, from fetch-cldr.sh (Windows, Unicode CLDR release 43)
// - mac-layouts.json, from maclayouts.swift run on a Mac (UCKeyTranslate)
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const sources = process.argv[2]
if (!sources) {
  console.error('usage: node scripts/layout-table/generate.ts <sources-dir>')
  process.exit(1)
}
const OUT = new URL(
  '../../packages/hotkeys/tests/fixtures/layout-table.json',
  import.meta.url,
)

interface Layout {
  id: string
  platform: 'linux' | 'windows' | 'mac'
  /** Whether a key types something with AltGr. Without it, right Alt is Alt. */
  altGr: boolean
  keys: Record<string, Array<string>>
}
const layouts: Array<Layout> = []

// Linux: xkb symbols, levels [base, Shift, AltGr, AltGr+Shift]
const keysyms = new Map<string, string>()
for (const line of readFileSync(join(sources, 'keysymdef.h'), 'utf8').split(
  '\n',
)) {
  const m = line.match(
    /^#define XK_(\w+)\s+0x[0-9a-f]+\s*\/\*[ (]*U\+([0-9A-F]{4,6})/,
  )
  if (m && !keysyms.has(m[1]!))
    keysyms.set(m[1]!, String.fromCodePoint(parseInt(m[2]!, 16)))
}
const unknownKeysyms = new Set<string>()
function keysymChar(name: string | undefined): string {
  if (!name || name === 'NoSymbol' || name === 'VoidSymbol') return ''
  if (name.startsWith('dead_')) return 'Dead'
  if (/^[a-zA-Z0-9]$/.test(name)) return name
  const u = name.match(/^U([0-9A-Fa-f]{4,8})$/)
  if (u) return printable(String.fromCodePoint(parseInt(u[1]!, 16)))
  const char = keysyms.get(name)
  // Function keysyms such as ISO_Level3_Shift type nothing
  if (
    char === undefined &&
    !/^(ISO_|Multi_key|Mode_switch|Zenkaku_Hankaku|Kanji)/.test(name)
  )
    unknownKeysyms.add(name)
  return printable(char ?? '')
}

/** A character a browser reports as `key`; control characters are not. */
function printable(char: string): string {
  return /^[\u0000-\u001f\u007f]$/.test(char) ? '' : char
}
const XKB_CODE: Record<string, string> = {
  TLDE: 'Backquote',
  BKSL: 'Backslash',
  LSGT: 'IntlBackslash',
}
const ROWS: Record<string, Array<string>> = {
  AE: [
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => `Digit${d}`),
    'Minus',
    'Equal',
  ],
  AD: [...'QWERTYUIOP']
    .map((l) => `Key${l}`)
    .concat(['BracketLeft', 'BracketRight']),
  AC: [...'ASDFGHJKL']
    .map((l) => `Key${l}`)
    .concat(['Semicolon', 'Quote', 'Backslash']),
  AB: [...'ZXCVBNM']
    .map((l) => `Key${l}`)
    .concat(['Comma', 'Period', 'Slash', 'IntlRo']),
}
const xkbCode = (name: string) =>
  XKB_CODE[name] ?? ROWS[name.slice(0, 2)]?.[Number(name.slice(2)) - 1]

let current: Layout | undefined
let xkbData = 'unknown version'
for (const line of readFileSync(join(sources, 'xkb.txt'), 'utf8').split('\n')) {
  const version = line.match(/^@@XKB_DATA (.*)$/)
  if (version) xkbData = version[1]!
  const head = line.match(/^@@LAYOUT (.*)$/)
  if (head) {
    current = {
      id: head[1]!.replace('()', ''),
      platform: 'linux',
      altGr: false,
      keys: {},
    }
    layouts.push(current)
    continue
  }
  const k =
    line.match(/^key <(\w+)>.*?symbols\[Group1\]=\s*\[\s*([^\]]*)\]/) ??
    line.match(/^key <(\w+)>\s*\{\s*\[\s*([^\]]*)\]/)
  if (!k || !current) continue
  // Right Alt is AltGr when it shifts to level 3, and plain Alt otherwise
  if (k[1] === 'RALT') {
    current.altGr = k[2]!.includes('ISO_Level3_Shift')
    continue
  }
  const code = xkbCode(k[1]!)
  if (!code) continue
  const syms = k[2]!.split(',').map((s) => s.trim())
  const levels = [0, 1, 2, 3].map((i) => keysymChar(syms[i]))
  // One- and two-level keys type the same with AltGr
  if (syms.length <= 2) {
    levels[2] = levels[0]!
    levels[3] = levels[1]!
  }
  current.keys[code] = levels
}

// Windows: CLDR keyMaps, levels [base, Shift, AltGr, AltGr+Shift]
const CLDR_ROWS: Record<string, Array<string | null>> = {
  E: ['Backquote', ...ROWS.AE!],
  D: [null, ...ROWS.AD!],
  C: [null, ...ROWS.AC!],
  B: ['IntlBackslash', ...ROWS.AB!],
}
const decode = (text: string) =>
  text
    .replace(/\\u\{([0-9A-Fa-f]+)\}/g, (_, h: string) =>
      String.fromCodePoint(parseInt(h, 16)),
    )
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
const WINDOWS = [
  'en',
  'en-GB',
  'de',
  'de-CH',
  'fr-CH',
  'fr',
  'fr-BE',
  'fr-CA',
  'es',
  'es-419',
  'pt',
  'pt-PT',
  'it',
  'da',
  'nb',
  'sv',
  'fi',
  'is',
  'cs',
  'sk',
  'hu',
  'tr',
  'ro',
  'sr-Latn',
  'sl',
  'et',
  'lt',
  'el',
  'ru',
  'uk',
  'bg',
  'he',
]
for (const id of WINDOWS) {
  const xml = readFileSync(
    join(sources, 'windows-cldr43', `${id}-t-k0-windows.xml`),
    'utf8',
  )
  // A dead key starts a transform of two or more characters
  const dead = new Set<string>()
  for (const m of xml.matchAll(/<transform from="([^"]*)"/g)) {
    const from = [...decode(m[1]!)]
    if (from.length >= 2) dead.add(from[0]!)
  }
  const keys: Record<string, Array<string>> = {}
  for (const m of xml.matchAll(
    /<keyMap( modifiers="([^"]*)")?>([\s\S]*?)<\/keyMap>/g,
  )) {
    const modifiers = m[1] === undefined ? '' : m[2]!
    const level =
      modifiers === ''
        ? 0
        : modifiers === 'shift'
          ? 1
          : modifiers.startsWith('altR+caps?')
            ? 2
            : modifiers.startsWith('altR+shift')
              ? 3
              : undefined
    if (level === undefined) continue
    for (const k of m[3]!.matchAll(
      /<map iso="([A-E])(\d\d)" to="([^"]*)"( transform="no")?/g,
    )) {
      const code = CLDR_ROWS[k[1]!]?.[Number(k[2])]
      if (!code) continue
      const c = printable(decode(k[3]!))
      // transform="no" types the character itself, such as French AltGr+9 `^`
      ;(keys[code] ??= ['', '', '', ''])[level] =
        dead.has(c) && !k[4] ? 'Dead' : c
    }
  }
  const altGr = Object.values(keys).some((levels) => levels[2] || levels[3])
  layouts.push({ id, platform: 'windows', altGr, keys })
}

// macOS: UCKeyTranslate, levels [plain, Shift, Option, Option+Shift,
// Command, Command+Shift, Command+Option, Command+Option+Shift]
const MAC = [
  'US',
  'British',
  'British-PC',
  'German',
  'Austrian',
  'SwissGerman',
  'SwissFrench',
  'French',
  'French-PC',
  'Belgian',
  'CanadianFrench-PC',
  'Spanish-ISO',
  'LatinAmerican',
  'Portuguese',
  'Brazilian-ABNT2',
  'Italian',
  'Dutch',
  'Danish',
  'Norwegian',
  'Swedish',
  'Finnish',
  'Icelandic',
  'Czech',
  'Slovak',
  'Hungarian',
  'Turkish-QWERTY-PC',
  'Romanian-Standard',
  'Croatian-PC',
  'Slovenian',
  'Serbian-Latin',
  'Estonian',
  'Lithuanian',
  'Latvian',
  'PolishPro',
  'Greek',
  'RussianWin',
  'Russian',
  'Ukrainian-PC',
  'Bulgarian',
  'Hebrew-PC',
  'Hebrew',
  'Arabic',
  'Thai',
  'Dvorak',
  'DVORAK-QWERTYCMD',
  'Colemak',
  'ABC-AZERTY',
  'ABC-QWERTZ',
  'USInternational-PC',
]
const MAC_LEVELS = [
  'plain',
  'shift',
  'option',
  'optionShift',
  'cmd',
  'cmdShift',
  'cmdOption',
  'cmdOptionShift',
]
const mac = JSON.parse(
  readFileSync(join(sources, 'mac-layouts.json'), 'utf8'),
) as {
  kbdType: number
  layouts: Array<{ id: string; keys: Record<string, Record<string, string>> }>
}
for (const id of MAC) {
  const layout = mac.layouts.find((l) => l.id === `com.apple.keylayout.${id}`)
  if (!layout) throw new Error(`macOS layout ${id} is not installed`)
  const keys: Record<string, Array<string>> = {}
  for (const [code, row] of Object.entries(layout.keys))
    keys[code] = MAC_LEVELS.map((level) => printable(row[level] ?? ''))
  layouts.push({ id, platform: 'mac', altGr: false, keys })
}

for (const layout of layouts) {
  const typing = Object.values(layout.keys).filter((levels) => levels[0])
  if (typing.length < 40)
    throw new Error(
      `${layout.platform} ${layout.id} types only ${typing.length} keys; check the dump`,
    )
}
if (unknownKeysyms.size > 0)
  throw new Error(
    `Keysyms missing from keysymdef.h: ${[...unknownKeysyms].join(' ')}`,
  )

writeFileSync(
  OUT,
  JSON.stringify({
    sources: [
      `Linux: xkeyboard-config ${xkbData} symbols via setxkbmap and xkbcomp (MIT license)`,
      'Windows: Unicode CLDR release 43 keyboards/windows (Unicode License v3)',
      `macOS: UCKeyTranslate on the installed keyboard layouts, keyboard type ${mac.kbdType}`,
      'Regenerate with scripts/layout-table/generate.ts',
    ],
    levels: {
      linux: ['base', 'shift', 'altgr', 'altgrShift'],
      windows: ['base', 'shift', 'altgr', 'altgrShift'],
      mac: MAC_LEVELS,
    },
    layouts,
  }),
)
const count = (p: string) => layouts.filter((l) => l.platform === p).length
console.log(
  `${layouts.length} layouts: ${count('linux')} Linux, ${count('windows')} Windows, ${count('mac')} macOS`,
)
