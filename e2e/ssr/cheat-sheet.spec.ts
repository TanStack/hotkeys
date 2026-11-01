import { expect, test } from '@playwright/test'
import { exampleUrl, examples } from './examples'
import type { Page } from '@playwright/test'

const MAC_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'
const WINDOWS_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'

const platforms = [
  {
    name: 'macOS',
    userAgent: MAC_UA,
    // detectPlatform() reads navigator.platform too, which follows the host OS
    navigatorPlatform: 'MacIntel',
    saveLabel: '⌘ S',
    saveKeys: 'Meta+s',
    // A format option the page applies after hydration
    toggle: { choice: 'Text labels', saveLabel: 'Cmd+S' },
  },
  {
    name: 'Windows',
    userAgent: WINDOWS_UA,
    navigatorPlatform: 'Win32',
    saveLabel: 'Ctrl+S',
    saveKeys: 'Control+s',
    toggle: { choice: 'macOS', saveLabel: '⌘ S' },
  },
]

/** The text of some HTML, without tags, framework comment markers, or extra spaces. */
function textOf(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** The text of a cheat sheet row in the server's HTML. */
function rowText(html: string, command: string): string {
  const start = html.search(new RegExp(`<tr[^>]*data-command="${command}"`))
  expect(start, `row "${command}" in the server HTML`).toBeGreaterThan(-1)
  return textOf(html.slice(start, html.indexOf('</tr>', start)))
}

/** Console errors and warnings, and uncaught errors, from the page. */
function collectProblems(page: Page): Array<string> {
  const problems: Array<string> = []
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') {
      problems.push(`console.${message.type()}: ${message.text()}`)
    }
  })
  page.on('pageerror', (error) => problems.push(`page error: ${error.message}`))
  return problems
}

declare global {
  interface Window {
    __labelChanges?: Array<string>
  }
}

/**
 * Runs in the page before its scripts. Records changes to the cheat sheet
 * labels after the HTML parser finishes, when only scripts change the page.
 * Hydration that matches the server's HTML leaves the labels alone. Most
 * frameworks patch or re-render a mismatched label without logging anything
 * in production builds, so this catches mismatches the console misses.
 */
function recordLabelChanges(): void {
  const changes: Array<string> = []
  window.__labelChanges = changes
  const label = 'td.label'
  const inLabel = (node: Node) =>
    !!(node instanceof Element ? node : node.parentElement)?.closest(label)
  const containsLabel = (node: Node) =>
    node instanceof Element &&
    !!(node.matches(label) || node.querySelector(label))
  // Frameworks add and remove comment markers while hydrating
  const isContent = (node: Node) =>
    node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE

  new MutationObserver((records) => {
    if (document.readyState === 'loading') return
    for (const record of records) {
      if (record.type === 'characterData') {
        const text = record.target.nodeValue
        if (
          record.target.nodeType === Node.TEXT_NODE &&
          inLabel(record.target) &&
          record.oldValue !== text
        ) {
          changes.push(`text ${record.oldValue} -> ${text}`)
        }
      } else if (
        [...record.removedNodes].some(containsLabel) ||
        (inLabel(record.target) &&
          [...record.addedNodes, ...record.removedNodes].some(isContent))
      ) {
        changes.push(
          `${record.addedNodes.length} added, ${record.removedNodes.length} removed`,
        )
      }
    }
  }).observe(document, {
    subtree: true,
    childList: true,
    characterData: true,
    characterDataOldValue: true,
  })
}

for (const example of examples) {
  const url = exampleUrl(example)

  test.describe(example.folder, () => {
    for (const platform of platforms) {
      test(`server HTML has ${platform.name} labels`, async ({ request }) => {
        const response = await request.get(url, {
          headers: { 'user-agent': platform.userAgent },
        })
        expect(response.ok()).toBe(true)
        const html = await response.text()
        const save = rowText(html, 'save')

        if (example.static) {
          // Built before any request: the label renders only in the browser
          expect(save).toBe('Save')
          expect(html).not.toContain('⌘')
          expect(html).not.toContain('Ctrl+S')
          expect(textOf(html)).toContain('Built as static HTML')
        } else {
          expect(save).toBe(`Save ${platform.saveLabel}`)
          expect(textOf(html)).toContain(
            `Server rendered for: ${platform.name}`,
          )
        }
      })

      test(`hydrates on ${platform.name} without mismatches`, async ({
        browser,
      }) => {
        const context = await browser.newContext({
          userAgent: platform.userAgent,
        })
        await context.addInitScript((navigatorPlatform) => {
          Object.defineProperty(Navigator.prototype, 'platform', {
            get: () => navigatorPlatform,
          })
        }, platform.navigatorPlatform)
        // VitePress renders its labels after hydration, by design
        if (!example.static) await context.addInitScript(recordLabelChanges)
        const page = await context.newPage()
        const problems = collectProblems(page)

        await page.goto(url)
        // Shown only after hydration, from the browser's own detection
        await expect(
          page.locator('.badge', { hasText: 'This browser:' }),
        ).toHaveText(`This browser: ${platform.name}`)

        const saveLabel = page.locator('tr[data-command="save"] td.label')
        await expect(saveLabel).toHaveText(platform.saveLabel)

        await page.keyboard.press(platform.saveKeys)
        await expect(page.locator('.log li').first()).toHaveText('Saved')
        if (!example.static) {
          expect(
            await page.evaluate(() => window.__labelChanges),
            'label changes during hydration',
          ).toEqual([])
        }

        await page
          .getByRole('radio', { name: platform.toggle.choice, exact: true })
          .check()
        await expect(saveLabel).toHaveText(platform.toggle.saveLabel)

        expect(problems).toEqual([])
        await context.close()
      })
    }
  })
}
