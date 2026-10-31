// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { gradeEditor } from './grade'
import { Editor as Fixture } from './fixture'
import { Editor as Solution } from './solution'
import { Editor as KeydownListener } from './mistakes/keydown-listener'
import { Editor as EnabledFlag } from './mistakes/enabled-flag'
import { Editor as HotkeyAboveProvider } from './mistakes/hotkey-above-provider'
import { Editor as RefCurrent } from './mistakes/ref-current'
import type { ComponentType } from 'react'
import type { EditorProps } from './fixture'

describe('skill task: editor shortcuts', () => {
  it('accepts the expected solution', () => {
    expect(gradeEditor(Solution)).toEqual([])
  })

  it('rejects the starting fixture', () => {
    expect(gradeEditor(Fixture)).toContain(
      "Command+S didn't save unsaved changes",
    )
  })

  it.each<[string, ComponentType<EditorProps>, string]>([
    ['a keydown listener', KeydownListener, 'Control+S saved on macOS'],
    [
      'a keydown listener',
      KeydownListener,
      'Command+S saved while the confirm dialog was open',
    ],
    [
      'enabled instead of an early return',
      EnabledFlag,
      "Command+S with no unsaved changes didn't block the browser's Save dialog",
    ],
    [
      'a hotkey above its own provider',
      HotkeyAboveProvider,
      "Escape didn't close the confirm dialog",
    ],
    [
      'ref.current as target',
      RefCurrent,
      "Delete didn't delete while the file list had focus",
    ],
  ])('rejects %s', (_name, Editor, failure) => {
    expect(gradeEditor(Editor)).toContain(failure)
  })

  const submission = process.env.HOTKEYS_SKILL_SUBMISSION
  it.runIf(submission)('grades the submission', async () => {
    const { Editor } = (await import(/* @vite-ignore */ submission!)) as {
      Editor: ComponentType<EditorProps>
    }
    expect(gradeEditor(Editor)).toEqual([])
  })
})
