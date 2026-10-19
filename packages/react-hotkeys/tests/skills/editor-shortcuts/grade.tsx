import React from 'react'
import { act, cleanup, render } from '@testing-library/react'
import { vi } from 'vitest'
import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import type { ComponentType } from 'react'
import type { EditorProps } from './fixture'

function press(init: KeyboardEventInit, target: EventTarget = document.body) {
  const event = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    ...init,
  })
  act(() => {
    target.dispatchEvent(event)
  })
  return event
}

/** Runs `run` while `navigator.platform` reports macOS. */
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
const controlS = { key: 's', code: 'KeyS', ctrlKey: true }
const deleteKey = { key: 'Delete', code: 'Delete' }
const escape = { key: 'Escape', code: 'Escape' }

/**
 * Renders an `Editor` and returns every requirement it fails. An empty array
 * means the submission passes.
 */
export function gradeEditor(Editor: ComponentType<EditorProps>): Array<string> {
  const failures: Array<string> = []
  HotkeyManager.resetInstance()

  onMac(() => {
    const spies = {
      onSave: vi.fn(),
      onDeleteSelected: vi.fn(),
      onCancelConfirm: vi.fn(),
    }
    const view = render(<Editor dirty={false} confirmOpen={false} {...spies} />)
    const list = view.getByRole('list', { name: 'Files' })

    // Delete belongs to the file list only.
    press(deleteKey)
    if (spies.onDeleteSelected.mock.calls.length > 0) {
      failures.push('Delete deleted while focus was outside the file list')
    }
    const deletesBefore = spies.onDeleteSelected.mock.calls.length
    act(() => list.focus())
    press(deleteKey, list)
    if (spies.onDeleteSelected.mock.calls.length !== deletesBefore + 1) {
      failures.push("Delete didn't delete while the file list had focus")
    }
    act(() => list.blur())

    // Mod+S with nothing to save keeps the browser's dialog closed.
    const clean = press(commandS)
    if (spies.onSave.mock.calls.length > 0) {
      failures.push('Command+S saved with no unsaved changes')
    }
    if (!clean.defaultPrevented) {
      failures.push(
        "Command+S with no unsaved changes didn't block the browser's Save dialog",
      )
    }

    view.rerender(<Editor dirty confirmOpen={false} {...spies} />)
    press(controlS)
    if (spies.onSave.mock.calls.length > 0) {
      failures.push('Control+S saved on macOS')
    }
    const savesBeforeCommand = spies.onSave.mock.calls.length
    press(commandS)
    if (spies.onSave.mock.calls.length !== savesBeforeCommand + 1) {
      failures.push("Command+S didn't save unsaved changes")
    }

    // The confirm dialog owns the keyboard.
    view.rerender(<Editor dirty confirmOpen {...spies} />)
    press(escape)
    if (spies.onCancelConfirm.mock.calls.length !== 1) {
      failures.push("Escape didn't close the confirm dialog")
    }
    const savesBefore = spies.onSave.mock.calls.length
    press(commandS)
    if (spies.onSave.mock.calls.length !== savesBefore) {
      failures.push('Command+S saved while the confirm dialog was open')
    }

    view.unmount()
    if (getHotkeyManager().getRegistrationCount() !== 0) {
      failures.push('Hotkeys stayed registered after the editor unmounted')
    }
  })

  cleanup()
  HotkeyManager.resetInstance()
  return failures
}
