import { validateHotkey } from '@tanstack/hotkeys'
import type { Hotkey, HotkeyIssue, HotkeyIssueReason } from '@tanstack/hotkeys'

// Core reports reason codes only, so the readable text lives here.
const DESCRIPTIONS: Record<HotkeyIssueReason, (part: string) => string> = {
  empty: () => 'The hotkey is empty, so it registers nothing.',
  'empty-part': () =>
    'A part between + signs is empty, so the hotkey registers nothing.',
  'unknown-modifier': (part) =>
    `'${part}' isn't a modifier, so the hotkey registers nothing. Use Control, Alt, Shift, Meta, or Mod.`,
  'invalid-physical-key': (part) =>
    `'${part}' isn't a KeyboardEvent.code. Write physical keys like [KeyS].`,
  'modifier-only': (part) =>
    `'${part}' is a modifier, so the hotkey registers nothing. Add a key that isn't a modifier.`,
  'unknown-key': (part) =>
    `'${part}' isn't a known key name, so the hotkey may never fire. Key names are case-sensitive, such as Escape and F1.`,
}

/** A readable sentence for one issue from `validateHotkey`. */
function describeHotkeyIssue(issue: HotkeyIssue): string {
  const text = DESCRIPTIONS[issue.reason](issue.part ?? '')
  return issue.step === undefined ? text : `Step ${issue.step + 1}: ${text}`
}

/** Readable errors and warnings for a hotkey, errors first. */
export function describeHotkeyIssues(hotkey: Hotkey): Array<string> {
  const { errors, warnings } = validateHotkey(hotkey)
  return [...errors, ...warnings].map(describeHotkeyIssue)
}
