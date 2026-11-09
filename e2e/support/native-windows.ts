// Windows driver for the nightly suite: compiles native/windows/SendInput.cs
// with the .NET Framework compiler that ships with Windows, then drives it.
import { execFileSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { lineProcess } from './native'
import type { NativeKeyboard } from './native'

/** Keyboard layout IDs (KLIDs) by short name. */
const WINDOWS_LAYOUTS = {
  us: '00000409',
  de: '00000407',
  /** Polish (Programmers), the default Polish layout. */
  pl: '00000415',
} as const

export function windowsKeyboard(): NativeKeyboard {
  const source = fileURLToPath(
    new URL('../native/windows/SendInput.cs', import.meta.url),
  )
  const outDir = fileURLToPath(new URL('../.cache', import.meta.url))
  mkdirSync(outDir, { recursive: true })
  const exe = join(outDir, 'SendInput.exe')
  const csc = join(
    process.env.WINDIR ?? 'C:\\Windows',
    'Microsoft.NET',
    'Framework64',
    'v4.0.30319',
    'csc.exe',
  )
  execFileSync(csc, ['/nologo', '/target:exe', `/out:${exe}`, source], {
    stdio: 'inherit',
  })
  const helper = lineProcess(exe)

  return {
    focus: async (page) => {
      const title = `hotkeys-${Math.random().toString(36).slice(2)}`
      await page.evaluate((value) => (document.title = value), title)
      // The title reaches the window frame asynchronously.
      await page.waitForTimeout(200)
      const detail = await helper.send(`focus ${title}`)
      if (!detail.includes('foreground=True')) console.warn(`focus: ${detail}`)
    },
    setLayout: async (layout) => {
      const klid = (WINDOWS_LAYOUTS as Partial<Record<string, string>>)[layout]
      if (!klid) throw new Error(`No Windows layout named ${layout}`)
      const detail = await helper.send(`layout ${klid}`)
      // The low word of an HKL is the language ID, such as 0407 for German.
      const [, active] = detail.match(/hkl=([0-9a-f]+)/) ?? []
      if (!active?.endsWith(klid.slice(4))) {
        throw new Error(`Layout ${layout} (${klid}) didn't activate: ${detail}`)
      }
    },
    press: async (combo) => {
      await helper.send(`press ${combo}`)
    },
    close: helper.close,
  }
}
