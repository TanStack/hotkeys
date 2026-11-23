// Prints the nightly real-input report as Markdown: one row per press, with
// the keydown each browser reported and what matched and fired. Reads the
// JSON lines that support/native.ts writes. CI appends it to the job summary.
//   node scripts/native-report.ts [test-results/native-events.jsonl]
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { CapturedEvent, NativePress } from '../support/native'

interface Row extends NativePress {
  environment: string
  project: string
  browser: string
  userAgent: string
  test: string
  retry: number
  layout: string
  keys: string
}

const path =
  process.argv[2] ??
  fileURLToPath(new URL('../test-results/native-events.jsonl', import.meta.url))

if (!existsSync(path)) {
  console.log(`No real-input report at ${path}.`)
  process.exit(0)
}

const rows = readFileSync(path, 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line) as Row)

// A retried test presses its keys again. Keep only its last attempt's rows.
const lastRetry = new Map<string, number>()
const testId = (row: Row) => `${row.project}\u0000${row.test}`
for (const row of rows) {
  lastRetry.set(
    testId(row),
    Math.max(lastRetry.get(testId(row)) ?? 0, row.retry),
  )
}
const latest = rows.filter((row) => row.retry === lastRetry.get(testId(row)))

function flags(event: CapturedEvent): string {
  const held = [
    event.ctrlKey && 'ctrl',
    event.altKey && 'alt',
    event.shiftKey && 'shift',
    event.metaKey && 'meta',
    event.altGraph && '**AltGraph**',
  ].filter(Boolean)
  return held.length ? held.join(' ') : '–'
}

function cell(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('`', 'ˋ')
}

function keydown(event: CapturedEvent | undefined): string {
  if (!event) return 'none'
  const composing = event.isComposing ? ' isComposing' : ''
  return cell(
    `key=${JSON.stringify(event.key)} code=${event.code} keyCode=${event.keyCode} ${flags(event)}${composing}`,
  )
}

function composition(events: Array<CapturedEvent>): string {
  const types = events
    .filter((event) => event.type.startsWith('composition'))
    .map((event) => `${event.type.slice(11)} ${JSON.stringify(event.data)}`)
  return types.length ? cell(types.join(', ')) : ''
}

const output: Array<string> = ['## Real-input event shapes', '']
for (const project of new Set(latest.map((row) => row.project))) {
  const projectRows = latest.filter((row) => row.project === project)
  const first = projectRows[0]!
  output.push(
    `### ${project}: ${first.browser}`,
    '',
    `<sub>${cell(first.userAgent)}</sub>`,
    '',
    '| Layout | Keys | Keydown | Composition | Matched | Fired |',
    '| --- | --- | --- | --- | --- | --- |',
  )
  for (const row of projectRows) {
    output.push(
      `| ${row.layout} | ${cell(row.keys)} | ${keydown(row.keydown)} | ${composition(row.events)} | ${cell(row.matches.join(', '))} | ${cell(row.fired.join(', '))} |`,
    )
  }
  output.push('')
}
console.log(output.join('\n'))
