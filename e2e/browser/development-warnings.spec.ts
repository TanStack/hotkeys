import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import {
  BUNDLE_PATH,
  PRODUCTION_BUNDLE_PATH,
  UNREPLACED_BUNDLE_PATH,
} from '../support/bundle'
import type { Page } from '@playwright/test'

// Bundlers replace `process.env.NODE_ENV` with a string and give the page no
// `process` global. The unit tests run in Node, which has one, so only a
// browser shows whether a development warning reaches the console.

const WARNINGS = [
  "[hotkeys] 'Mod+K' is already registered",
  "[hotkeys] Unknown key 'escape' in 'escape' (names are case-sensitive)",
  '[hotkeys] Invalid hotkey "Ctl+J" was not registered',
  "[hotkeys] Exclusive scope 'dialog' is already active",
  "[hotkeys] Invalid hotkey 'Ctl+K': unknown-modifier 'Ctl'",
  "[hotkeys] Hotkey 'Control+escape' may never fire: unknown-key 'escape'",
]

/** Loads a bundle, triggers every library warning once, and returns what the console got. */
async function libraryLogs(page: Page, bundlePath: string) {
  const logs: Array<string> = []
  const errors: Array<string> = []
  page.on('console', (message) => {
    if (message.text().startsWith('[hotkeys]')) logs.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.setContent('<!doctype html><html><body></body></html>')
  await page.addScriptTag({ path: bundlePath })
  const state = await page.evaluate(() => {
    const { getHotkeyManager, checkHotkey } = window.TanStackHotkeys
    const manager = getHotkeyManager()
    manager.register('Mod+K', () => {})
    manager.register('Mod+K', () => {})
    manager.register('escape' as never, () => {})
    manager.register('Ctl+J' as never, () => {})
    manager.activateScope('dialog', { exclusive: true })
    manager.activateScope('dialog', { exclusive: true })
    checkHotkey('Ctl+K')
    checkHotkey('Control+escape')
    return {
      process: typeof process,
      registrations: manager.registrations.state.size,
    }
  })
  return { logs, errors, ...state }
}

test.describe('development warnings', () => {
  test('print in a development bundle', async ({ page }) => {
    const result = await libraryLogs(page, BUNDLE_PATH)
    expect(result.process).toBe('undefined')
    expect(result.errors).toEqual([])
    expect(result.logs).toEqual(WARNINGS)
  })

  test('are silent in a production bundle', async ({ page }) => {
    const result = await libraryLogs(page, PRODUCTION_BUNDLE_PATH)
    expect(result.errors).toEqual([])
    expect(result.logs).toEqual([])
    expect(result.registrations).toBe(3)
  })

  test('are removed from a production bundle', () => {
    const bundle = readFileSync(PRODUCTION_BUNDLE_PATH, 'utf8')
    for (const text of [
      'names are case-sensitive',
      'was not registered',
      'Exclusive scope',
      'may never fire',
      'Server-rendered label',
      'console.warn',
      'console.error',
    ]) {
      expect(bundle, text).not.toContain(text)
    }
  })

  // Nothing replaced `process.env.NODE_ENV`, and reading it must not throw.
  test('are silent on a page with no bundler', async ({ page }) => {
    const result = await libraryLogs(page, UNREPLACED_BUNDLE_PATH)
    expect(result.process).toBe('undefined')
    expect(result.errors).toEqual([])
    expect(result.logs).toEqual([])
    expect(result.registrations).toBe(3)
  })
})
