import React from 'react'
import { act, cleanup, fireEvent, render, within } from '@testing-library/react'
import { vi } from 'vitest'
import { HotkeyManager, areHotkeysEqual } from '@tanstack/hotkeys'
import type { Hotkey } from '@tanstack/hotkeys'
import type { ComponentType, ReactNode } from 'react'
import type { ShortcutId } from './fixture'

export interface SettingsModule {
  Root: ComponentType<{ children: ReactNode }>
  EditorPage: ComponentType<{ onSave: () => void }>
  ReportsPage: ComponentType<{ onPrint: () => void }>
  CheatSheet: ComponentType
  ShortcutRow: ComponentType<{ id: ShortcutId }>
}

function press(init: KeyboardEventInit) {
  act(() => {
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        ...init,
      }),
    )
  })
}

function release(init: KeyboardEventInit) {
  act(() => {
    document.body.dispatchEvent(
      new KeyboardEvent('keyup', { bubbles: true, cancelable: true, ...init }),
    )
  })
}

function tap(init: KeyboardEventInit) {
  press(init)
  release(init)
}

function onMac(run: () => void) {
  const descriptor = Object.getOwnPropertyDescriptor(navigator, 'platform')
  Object.defineProperty(navigator, 'platform', {
    value: 'MacIntel',
    configurable: true,
  })
  try {
    run()
  } finally {
    if (descriptor) Object.defineProperty(navigator, 'platform', descriptor)
    else delete (navigator as { platform?: string }).platform
  }
}

const commandS = { key: 's', code: 'KeyS', metaKey: true }
const commandE = { key: 'e', code: 'KeyE', metaKey: true }
const commandP = { key: 'p', code: 'KeyP', metaKey: true }

function cheatSheetText(container: HTMLElement): Array<string> {
  const list = within(container).getByRole('list', {
    name: 'Keyboard shortcuts',
  })
  return within(list)
    .queryAllByRole('listitem')
    .map((item) => item.textContent?.replace(/\s+/g, ' ').trim() ?? '')
}

function readSaved(): unknown {
  const raw = localStorage.getItem('hotkeys')
  try {
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return raw
  }
}

function isCommandE(value: unknown): boolean {
  return (
    (typeof value === 'string' || Array.isArray(value)) &&
    (areHotkeysEqual(value as Hotkey, 'Mod+[KeyE]', 'mac') ||
      areHotkeysEqual(value as Hotkey, 'Mod+E', 'mac'))
  )
}

/**
 * Renders the shortcut settings app and returns every requirement it fails.
 * An empty array means the submission passes.
 */
export function gradeSettings(app: SettingsModule): Array<string> {
  const { Root, EditorPage, ReportsPage, CheatSheet, ShortcutRow } = app
  const failures: Array<string> = []
  HotkeyManager.resetInstance()
  localStorage.clear()

  onMac(() => {
    const onSave = vi.fn()
    const onPrint = vi.fn()
    const page = () => (
      <Root>
        <EditorPage onSave={onSave} />
        <CheatSheet />
        <ShortcutRow id="doc.save" />
      </Root>
    )

    let view = render(page())

    // The cheat sheet lists shortcuts on pages that haven't rendered.
    const listed = cheatSheetText(view.container)
    if (
      !listed.some((text) => text.startsWith('Save') && text.includes('⌘ S'))
    ) {
      failures.push('The cheat sheet is missing Save (⌘ S)')
    }
    if (
      !listed.some(
        (text) => text.startsWith('Print report') && text.includes('⌘ P'),
      )
    ) {
      failures.push(
        "The cheat sheet is missing Print report (⌘ P) while the reports page isn't open",
      )
    }

    tap(commandS)
    if (onSave.mock.calls.length !== 1) {
      failures.push("Command+S didn't save")
    }

    // Rebind Save to Command+E with the row's recorder.
    // Enter commits a sequence recorder and does nothing after a chord recorder.
    fireEvent.click(
      within(view.container).getByRole('button', { name: /change/i }),
    )
    tap(commandE)
    tap({ key: 'Enter', code: 'Enter' })

    const savesBefore = onSave.mock.calls.length
    tap(commandE)
    if (onSave.mock.calls.length !== savesBefore + 1) {
      failures.push("The recorded shortcut Command+E didn't save")
    }
    const savesBeforeOld = onSave.mock.calls.length
    tap(commandS)
    if (onSave.mock.calls.length !== savesBeforeOld) {
      failures.push('Command+S still saved after Save was rebound')
    }

    const updated = cheatSheetText(view.container)
    if (
      !updated.some((text) => text.startsWith('Save') && text.includes('⌘ E'))
    ) {
      failures.push("The cheat sheet didn't show the new Save shortcut (⌘ E)")
    }

    // Only the changed shortcut is saved.
    const saved = readSaved()
    if (saved === null) {
      failures.push('Nothing was saved to localStorage under "hotkeys"')
    } else if (
      typeof saved !== 'object' ||
      Array.isArray(saved) ||
      Object.keys(saved).join() !== 'doc.save' ||
      !isCommandE((saved as Record<string, unknown>)['doc.save'])
    ) {
      failures.push(
        `Saved data should hold only the changed shortcut, but was ${JSON.stringify(saved)}`,
      )
    }

    // Reload: a new Root restores the saved shortcut.
    view.unmount()
    HotkeyManager.resetInstance()
    view = render(page())
    const savesAfterReload = onSave.mock.calls.length
    tap(commandE)
    if (onSave.mock.calls.length !== savesAfterReload + 1) {
      failures.push('The rebound shortcut was lost after Root mounted again')
    }
    view.unmount()

    // The reports page still prints with its default.
    view = render(
      <Root>
        <ReportsPage onPrint={onPrint} />
      </Root>,
    )
    tap(commandP)
    if (onPrint.mock.calls.length !== 1) {
      failures.push("Command+P didn't print on the reports page")
    }
    view.unmount()
  })

  cleanup()
  localStorage.clear()
  HotkeyManager.resetInstance()
  return failures
}
