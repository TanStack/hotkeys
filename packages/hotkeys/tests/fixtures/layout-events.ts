import table from './layout-table.json'
import type { HotkeyPlatform } from '../../src'

// Keyboard events as browsers report them on real layouts, built from
// layout-table.json (xkb for Linux, Unicode CLDR for Windows, UCKeyTranslate
// for macOS). `pnpm generate:layout-table <sources-dir>` regenerates it; see
// scripts/layout-table/generate.ts for the sources. Linux and Windows levels: base, Shift,
// AltGr, AltGr+Shift. macOS levels: plain, Shift, Option, Option+Shift,
// Command, Command+Shift, Command+Option, Command+Option+Shift.

export interface LayoutModifiers {
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  /** AltGr held: Linux reports AltGraph alone, Windows Control+Alt plus AltGraph. */
  altGraph?: boolean
}

export interface LayoutPress {
  layout: string
  platform: HotkeyPlatform
  code: string
  mods: LayoutModifiers
  init: KeyboardEventInit & { key: string; altGraph?: boolean }
  label: string
}

interface TableLayout {
  id: string
  platform: HotkeyPlatform
  /** Whether the layout has AltGr. Without it, right Alt is Alt. */
  altGr: boolean
  keys: Record<string, Array<string>>
}

const LAYOUTS = (table.layouts as Array<TableLayout>).map((layout) => ({
  ...layout,
  keys: new Map(Object.entries(layout.keys)),
}))

export type Layout = (typeof LAYOUTS)[number]

export function layoutsFor(platform: HotkeyPlatform): Array<Layout> {
  return LAYOUTS.filter((layout) => layout.platform === platform)
}

export function findLayout(platform: HotkeyPlatform, id: string): Layout {
  const layout = LAYOUTS.find((l) => l.platform === platform && l.id === id)
  if (!layout) throw new Error(`No ${platform} layout ${id}`)
  return layout
}

/** What the key types with these modifiers, or undefined when it types nothing. */
function layoutKey(
  layout: Layout,
  code: string,
  mods: LayoutModifiers,
): string | undefined {
  const levels = layout.keys.get(code)
  if (!levels) return undefined
  let level: number
  if (layout.platform === 'mac') {
    // Layouts define their own Command layers: US Cmd+Shift+/ types `/`,
    // and French Cmd+Shift+& types `1`, as browsers report them
    if (mods.meta && mods.alt) level = mods.shift ? 7 : 6
    else if (mods.meta) level = mods.shift ? 5 : 4
    else if (mods.alt) level = mods.shift ? 3 : 2
    else level = mods.shift ? 1 : 0
  } else if (mods.altGraph) {
    level = mods.shift ? 3 : 2
  } else {
    level = mods.shift ? 1 : 0
  }
  const key = levels[level]
  return key ? key : undefined
}

function describe(mods: LayoutModifiers): string {
  return (
    [
      mods.ctrl && 'ctrl',
      mods.alt && 'alt',
      mods.altGraph && 'altgr',
      mods.shift && 'shift',
      mods.meta && 'meta',
    ]
      .filter(Boolean)
      .join('+') || 'none'
  )
}

/** The keydown init a browser sends, or undefined when the key types nothing. */
export function layoutPress(
  layout: Layout,
  code: string,
  mods: LayoutModifiers,
): LayoutPress | undefined {
  // Without AltGr (macOS, US), there is no AltGr key to press
  if (mods.altGraph && !layout.altGr) return undefined
  const windows = layout.platform === 'windows'
  // Windows treats Control+Alt as AltGr, and reports AltGr as Control+Alt
  const altGr =
    layout.altGr && (mods.altGraph || (windows && mods.ctrl && mods.alt))
  let key = layoutKey(layout, code, { ...mods, altGraph: altGr })
  // `{ altGraph }` is AltGraph alone, as current Chrome and Firefox report
  // Windows AltGr; `{ ctrl, alt }` is Control+Alt, as older browsers do
  const init: KeyboardEventInit & { altGraph?: boolean } = {
    code,
    ctrlKey: !!mods.ctrl,
    altKey: !!mods.alt,
    shiftKey: !!mods.shift,
    metaKey: !!mods.meta,
  }
  if (altGr) {
    if (key !== undefined) init.altGraph = true
    // AltGr typed nothing new: Windows reports the plain character, and
    // Linux types nothing
    else if (windows) {
      key = layoutKey(layout, code, { shift: mods.shift })
      if (mods.altGraph) init.altGraph = true
    }
  } else if (!windows && mods.altGraph) {
    return undefined
  }
  if (key === undefined) return undefined
  // macOS browsers set keyCode from the letter the key types without
  // modifiers, and the matcher reads it for Option
  const plain = layout.keys.get(code)?.[0]
  if (layout.platform === 'mac' && plain && /^[a-z]$/i.test(plain)) {
    init.keyCode = plain.toUpperCase().charCodeAt(0)
  }
  return {
    layout: layout.id,
    platform: layout.platform,
    code,
    mods,
    init: { ...init, key },
    label: `${layout.platform} ${layout.id} ${describe(mods)}+${code} (${JSON.stringify(key)})`,
  }
}

/**
 * The keyup a browser sends for the key after the `released` modifiers came up
 * first: the key reports what it types with the modifiers still held.
 */
export function releaseInit(
  layout: Layout,
  press: LayoutPress,
  released: Array<keyof LayoutModifiers>,
): LayoutPress['init'] {
  const mods = { ...press.mods }
  for (const modifier of released) mods[modifier] = false
  const after = layoutPress(layout, press.code, mods)
  return (
    after?.init ?? {
      ...press.init,
      ctrlKey: !!mods.ctrl,
      altKey: !!mods.alt,
      shiftKey: !!mods.shift,
      metaKey: !!mods.meta,
      altGraph: false,
    }
  )
}

/** Every modifier combination, with AltGr on Linux and Windows. */
function modifierCombos(platform: HotkeyPlatform): Array<LayoutModifiers> {
  const combos: Array<LayoutModifiers> = Array.from({ length: 16 }, (_, i) => ({
    ctrl: !!(i & 1),
    alt: !!(i & 2),
    shift: !!(i & 4),
    meta: !!(i & 8),
  }))
  if (platform !== 'mac') {
    combos.push({ altGraph: true }, { altGraph: true, shift: true })
  }
  return combos
}

/** Every press on every layout of the platform. */
export function allLayoutPresses(platform: HotkeyPlatform): Array<LayoutPress> {
  const presses: Array<LayoutPress> = []
  for (const layout of layoutsFor(platform)) {
    for (const code of layout.keys.keys()) {
      for (const mods of modifierCombos(platform)) {
        const press = layoutPress(layout, code, mods)
        if (press) presses.push(press)
      }
    }
  }
  return presses
}
