import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import ts from 'typescript'
import * as lit from 'lit'
import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import * as decorators from '../src/decorators/hotkey'
import type { LitElement } from 'lit'
// Type-only, so Vitest never loads the decorator syntax.
import type * as Fixture from './fixtures/decorated'

// Vitest doesn't lower decorators, so compile them with TypeScript here.
const fixture = join(
  dirname(fileURLToPath(import.meta.url)),
  'fixtures/decorated.ts',
)
const modes = {
  legacy: { experimentalDecorators: true, useDefineForClassFields: false },
  standard: {},
} satisfies Record<string, ts.CompilerOptions>

type Calls = LitElement & { calls: Array<string> }

function run(
  source: string,
  options: ts.CompilerOptions,
): Partial<Record<string, typeof LitElement>> {
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      ...options,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  })
  const modules: Record<string, unknown> = {
    lit,
    '../../src/decorators/hotkey': decorators,
  }
  const exports = {}
  new Function('require', 'exports', outputText)(
    (id: string) => modules[id],
    exports,
  )
  return exports
}

const runFixture = (options: ts.CompilerOptions) =>
  run(readFileSync(fixture, 'utf8'), options) as unknown as typeof Fixture

let count = 0
function mount(element: typeof LitElement): Calls {
  const name = `decorated-host-${count++}`
  customElements.define(name, element)
  const host = document.createElement(name) as Calls
  document.body.append(host)
  return host
}

const press = (key: string, init: KeyboardEventInit = {}) =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, ...init }),
  )

afterEach(() => {
  document.body.replaceChildren()
  HotkeyManager.resetInstance()
})

describe.each(Object.entries(modes))(
  '@hotkey with %s decorators',
  (_, options) => {
    it('type-checks', () => {
      const program = ts.createProgram([fixture], {
        ...options,
        strict: true,
        noEmit: true,
        skipLibCheck: true,
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
        types: [],
      })
      const errors = ts
        .getPreEmitDiagnostics(program)
        .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))
      expect(errors).toEqual([])
    }, 30_000)

    it('registers, fires, and unregisters', () => {
      const { DecoratedBase } = runFixture(options)
      const host = mount(DecoratedBase)
      const hotkeys = () => getHotkeyManager().registrations.state.size
      expect(hotkeys()).toBe(5)
      press('k')
      press('g')
      press('h')
      press('s', { ctrlKey: true })
      expect(host.calls).toEqual(['base', 'G H', 'S'])
      host.remove()
      expect(hotkeys()).toBe(0)
    })

    it('calls a subclass override', () => {
      const { DecoratedSub } = runFixture(options)
      const host = mount(DecoratedSub)
      press('k')
      expect(host.calls).toEqual(['sub'])
    })
  },
)

it('calls a #private method with standard decorators', () => {
  const { DecoratedPrivate } = run(
    `
    import { LitElement } from 'lit'
    import { hotkey } from '../../src/decorators/hotkey'
    export class DecoratedPrivate extends LitElement {
      calls = []
      @hotkey('P')
      #onP() {
        this.calls.push('private')
      }
    }
    `,
    modes.standard,
  )
  const host = mount(DecoratedPrivate!)
  press('p')
  expect(host.calls).toEqual(['private'])
})
