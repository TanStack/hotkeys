// Shared fixture for the nightly real-input suites (`native/`). Each suite
// sends OS-level key presses through its own driver (Windows SendInput, a
// Wayland virtual keyboard, X11 with an ibus input method), records every
// key and composition event the page saw, and appends them to a report that
// `scripts/native-report.ts` turns into a table.
import { spawn } from 'node:child_process'
import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { test as base, expect } from './fixtures'
import type { Page } from '@playwright/test'
import type { LoadedHarness } from './fixtures'
import type { HarnessOptions } from './page'

/** Key names are physical positions: `KeyQ`, `Digit2`, plus Control, Alt, Shift and AltGr. */
export interface NativeKeyboard {
  /** Gives the page's window OS keyboard focus. */
  focus: (page: Page) => void | Promise<void>
  /** Switches the keyboard layout or input method, such as `'de'` or `'anthy'`. */
  setLayout: (layout: string) => void | Promise<void>
  /** Holds each key down in order, then releases them in reverse order: `'AltGr+KeyQ'`. */
  press: (combo: string) => void | Promise<void>
  close: () => void | Promise<void>
}

/** One event as the page saw it, captured on window before any hotkey ran. */
export interface CapturedEvent {
  type: string
  key?: string
  code?: string
  keyCode?: number
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  altGraph?: boolean
  location?: number
  repeat?: boolean
  isComposing?: boolean
  /** Composition and input events. */
  data?: string | null
}

export interface NativePress {
  /** Every key, composition and input event, in order. */
  events: Array<CapturedEvent>
  /** The last keydown that isn't a modifier key. */
  keydown: CapturedEvent | undefined
  /** Observed bindings that `matchesKeyboardEvent` accepts for that keydown. */
  matches: Array<string>
  /** `normalizeHotkey(parseKeyboardEvent(event))` for that keydown. */
  parsed: string | undefined
  /** Names of registered hotkeys that fired. */
  fired: Array<string>
}

export interface NativeSessionOptions {
  /** Body HTML. Defaults to a page-sized `div`. */
  body?: string
  /** Bindings to check against every keydown with `matchesKeyboardEvent`. */
  bindings: Array<string>
  /** Hotkeys registered with the manager, by binding, with optional options. */
  registered?: Array<string | [string, HarnessOptions]>
  /** Layout or input method to switch to before the first press. */
  layout?: string
}

export interface NativeSession {
  hk: LoadedHarness
  page: Page
  /** Presses real keys, waits for their events, and adds them to the report. */
  press: (combo: string) => Promise<NativePress>
  setLayout: (layout: string) => Promise<void>
}

const MODIFIER_KEYS = ['Control', 'Alt', 'AltGraph', 'Shift', 'Meta']

/** JSON lines, one per press. `scripts/native-report.ts` reads them. */
const REPORT_PATH =
  process.env.E2E_NATIVE_REPORT ??
  fileURLToPath(new URL('../test-results/native-events.jsonl', import.meta.url))

/**
 * Creates a test with a `session` fixture for one input environment. The
 * keyboard driver lives for the whole worker, so helper processes start once.
 */
export function useNativeInput(
  environment: string,
  createKeyboard: () => NativeKeyboard | Promise<NativeKeyboard>,
) {
  return base.extend<
    { session: (options: NativeSessionOptions) => Promise<NativeSession> },
    { keyboard: NativeKeyboard }
  >({
    keyboard: [
      // oxlint-disable-next-line no-empty-pattern -- Playwright needs the destructuring
      async ({}, use) => {
        const keyboard = await createKeyboard()
        await use(keyboard)
        await keyboard.close()
      },
      { scope: 'worker' },
    ],
    session: async ({ page, harness, keyboard, browser }, use, testInfo) => {
      let layout = ''
      await use(async (options) => {
        const hk = await harness(
          options.body ??
            '<div id="surface" style="position:fixed;inset:0" tabindex="-1"></div>',
        )
        await page.evaluate(installCapture)
        await hk.call('observe', options.bindings)
        for (const entry of options.registered ?? []) {
          const [binding, registerOptions] =
            typeof entry === 'string' ? [entry, undefined] : entry
          await hk.register(binding, binding as never, registerOptions)
        }
        const userAgent = await page.evaluate(() => navigator.userAgent)

        const setLayout = async (next: string) => {
          await keyboard.setLayout(next)
          layout = next
        }

        const press = async (combo: string): Promise<NativePress> => {
          await hk.clear()
          await page.evaluate(() => (window.nativeEvents.length = 0))
          await keyboard.press(combo)
          await waitForKeyup(page)
          const events = await page.evaluate(() => window.nativeEvents)
          const keydowns = await hk.keydowns()
          const observed = keydowns.at(-1)
          const result: NativePress = {
            events,
            keydown: events
              .filter(
                (event) =>
                  event.type === 'keydown' &&
                  !MODIFIER_KEYS.includes(event.key ?? ''),
              )
              .at(-1),
            matches: observed?.matches ?? [],
            parsed: observed?.parsed,
            fired: await hk.firedNames(),
          }
          mkdirSync(dirname(REPORT_PATH), { recursive: true })
          appendFileSync(
            REPORT_PATH,
            `${JSON.stringify({
              environment,
              project: testInfo.project.name,
              browser: `${testInfo.project.use.channel ?? testInfo.project.use.browserName} ${browser.version()}`,
              userAgent,
              test: testInfo.title,
              retry: testInfo.retry,
              layout,
              keys: combo,
              ...result,
            })}\n`,
          )
          return result
        }

        await keyboard.focus(page)
        if (options.layout) await setLayout(options.layout)
        await waitForKeyboardInput(page, keyboard)
        return { hk, page, press, setLayout }
      })
    },
  })
}

/** Runs in the page: logs key, composition and input events on window. */
function installCapture() {
  const events: Array<CapturedEvent> = []
  window.nativeEvents = events
  for (const type of ['keydown', 'keyup']) {
    window.addEventListener(
      type,
      (event) => {
        const key = event as KeyboardEvent
        events.push({
          type,
          key: key.key,
          code: key.code,
          keyCode: key.keyCode,
          ctrlKey: key.ctrlKey,
          altKey: key.altKey,
          shiftKey: key.shiftKey,
          metaKey: key.metaKey,
          altGraph: key.getModifierState('AltGraph'),
          location: key.location,
          repeat: key.repeat,
          isComposing: key.isComposing,
        })
      },
      true,
    )
  }
  for (const type of [
    'compositionstart',
    'compositionupdate',
    'compositionend',
    'input',
  ]) {
    window.addEventListener(
      type,
      (event) => {
        events.push({
          type,
          data: (event as CompositionEvent | InputEvent).data,
          ...(event instanceof InputEvent && {
            isComposing: event.isComposing,
          }),
        })
      },
      true,
    )
  }
}

/** Waits for the last key's keyup, then lets trailing events arrive. */
async function waitForKeyup(page: Page): Promise<void> {
  await page.waitForFunction(
    () => window.nativeEvents.some((event) => event.type === 'keyup'),
    undefined,
    { timeout: 3000 },
  )
  await page.waitForTimeout(150)
}

/**
 * Focuses the window until a real Escape press reaches the page. Browsers can
 * drop the first presses right after their window opens or gains focus.
 */
async function waitForKeyboardInput(
  page: Page,
  keyboard: NativeKeyboard,
): Promise<void> {
  for (let attempt = 1; attempt <= 5; attempt++) {
    await page.evaluate(() => (window.nativeEvents.length = 0))
    await keyboard.press('Escape')
    const arrived = await page
      .waitForFunction(
        () => window.nativeEvents.some((event) => event.type === 'keyup'),
        undefined,
        { timeout: 1500 },
      )
      .then(
        () => true,
        () => false,
      )
    if (arrived) {
      await page.waitForTimeout(100)
      await page.evaluate(() => {
        window.nativeEvents.length = 0
        window.harness.clear()
      })
      return
    }
    const state = await page.evaluate(() => ({
      hasFocus: document.hasFocus(),
      visibility: document.visibilityState,
      activeElement: document.activeElement?.tagName,
    }))
    console.warn(
      `Probe key press ${attempt} didn't reach the page: ${JSON.stringify(state)}`,
    )
    await keyboard.focus(page)
  }
  throw new Error('Real key presses never reached the page')
}

/**
 * Starts a helper process that reads one command per line and answers each
 * with `ok [detail]` or `error <message>`.
 */
export function lineProcess(file: string, args: Array<string> = []) {
  const child = spawn(file, args, { stdio: ['pipe', 'pipe', 'inherit'] })
  const waiting: Array<(line: string) => void> = []
  const exited = new Promise<never>((_, reject) => {
    child.once('error', reject)
    child.once('exit', (code) =>
      reject(new Error(`${file} exited with code ${code}`)),
    )
  })
  exited.catch(() => {})
  createInterface({ input: child.stdout }).on('line', (line) =>
    waiting.shift()?.(line),
  )
  return {
    send: (command: string): Promise<string> =>
      Promise.race([
        exited,
        new Promise<string>((resolve, reject) => {
          waiting.push((line) =>
            line.startsWith('ok')
              ? resolve(line.slice(2).trim())
              : reject(new Error(`${command}: ${line}`)),
          )
          child.stdin.write(`${command}\n`)
        }),
      ]),
    close: () => {
      child.stdin.end()
      child.kill()
    },
  }
}

declare global {
  interface Window {
    nativeEvents: Array<CapturedEvent>
  }
}

export { expect }
