// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { gradeSettings } from './grade'
import * as fixture from './fixture'
import * as solution from './solution'
import * as registrationsCheatSheet from './mistakes/registrations-cheat-sheet'
import * as hotkeyValue from './mistakes/hotkey-value'
import * as fullListStorage from './mistakes/full-list-storage'
import type { SettingsModule } from './grade'

describe('skill task: shortcut settings', () => {
  it('accepts the expected solution', () => {
    expect(gradeSettings(solution)).toEqual([])
  })

  it('rejects the starting fixture', () => {
    expect(gradeSettings(fixture)).toContain("Command+S didn't save")
  })

  it('rejects a cheat sheet built from registrations', () => {
    expect(gradeSettings(registrationsCheatSheet)).toContain(
      "The cheat sheet is missing Print report (⌘ P) while the reports page isn't open",
    )
  })

  it('rejects registering the hotkey value', () => {
    expect(gradeSettings(hotkeyValue)).toContain(
      "The recorded shortcut Command+E didn't save",
    )
  })

  it('rejects saving every effective hotkey', () => {
    expect(
      gradeSettings(fullListStorage).some((failure) =>
        failure.startsWith('Saved data should hold only the changed shortcut'),
      ),
    ).toBe(true)
  })

  const submission = process.env.HOTKEYS_SKILL_SUBMISSION
  it.runIf(submission)('grades the submission', async () => {
    const app = (await import(/* @vite-ignore */ submission!)) as SettingsModule
    expect(gradeSettings(app)).toEqual([])
  })
})
