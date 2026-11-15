// @vitest-environment happy-dom

import { HotkeyManager } from '@tanstack/hotkeys'
import { cleanup, fireEvent, render } from '@testing-library/react'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppHotkeysProvider } from '../src/AppHotkeysProvider'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useAppHotkeyList } from '../src/useAppHotkeys'
import { useHotkey } from '../src/useHotkey'
import type { AppHotkeys } from '@tanstack/hotkeys'

// What a client component receives when a React Server Component passes
// `defineAppHotkeys({ 'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } } })`.
// This file never calls `defineAppHotkeys`, like a client bundle where only a
// server module imports the declarations.
const fromServer = JSON.parse(
  JSON.stringify({
    'doc.save': {
      '~appHotkey': true,
      id: 'doc.save',
      hotkey: 'Mod+S',
      defaultHotkey: 'Mod+S',
      meta: { name: 'Save' },
    },
  }),
) as AppHotkeys

function Save({ onSave }: { onSave: () => void }) {
  useHotkey(fromServer['doc.save']!, onSave)
  const list = useAppHotkeyList()
  return (
    <output>
      {list.map((item) => `${item.appHotkey.id}:${item.status}`).join(',')}
    </output>
  )
}

// The tests run in order: the first one needs a bundle where no provider has
// loaded the store yet.
describe('app hotkeys from a server component', () => {
  afterEach(() => {
    cleanup()
    HotkeyManager.resetInstance()
  })

  it('HotkeysProvider says to use AppHotkeysProvider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() =>
      render(
        <HotkeysProvider appHotkeys={fromServer}>
          <Save onSave={() => {}} />
        </HotkeysProvider>,
      ),
    ).toThrow('AppHotkeysProvider')

    vi.restoreAllMocks()
  })

  it('AppHotkeysProvider renders them on the server', () => {
    const html = renderToString(
      <AppHotkeysProvider appHotkeys={fromServer}>
        <Save onSave={() => {}} />
      </AppHotkeysProvider>,
    )

    expect(html).toContain('doc.save:inactive')
  })

  it('AppHotkeysProvider registers them in the browser', () => {
    const onSave = vi.fn()
    const view = render(
      <AppHotkeysProvider
        appHotkeys={fromServer}
        defaultOptions={{ platform: 'mac' }}
      >
        <Save onSave={onSave} />
      </AppHotkeysProvider>,
    )

    fireEvent.keyDown(document, { key: 's', code: 'KeyS', metaKey: true })

    expect(view.getByText('doc.save:active')).toBeTruthy()
    expect(onSave).toHaveBeenCalledTimes(1)
  })
})
