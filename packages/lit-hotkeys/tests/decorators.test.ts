import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import * as lit from 'lit'
import ts from 'typescript'
import { afterEach, describe, expect, it, vi } from 'vitest'
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
  vi.restoreAllMocks()
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

    const hotkeys = () =>
      Array.from(getHotkeyManager().registrations.state.values()).map(
        (registration) => registration.hotkey,
      )

    it('replaces the parent hotkey when an override is decorated with the same key', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { DecoratedSameKey } = runFixture(options)
      const host = mount(DecoratedSameKey)
      expect(hotkeys().filter((hotkey) => hotkey === 'K')).toHaveLength(1)
      press('k')
      expect(host.calls).toEqual(['same key'])
      expect(warn).not.toHaveBeenCalled()
    })

    it('moves the method to the key of a decorated override', () => {
      const { DecoratedNewKey } = runFixture(options)
      const host = mount(DecoratedNewKey)
      expect(hotkeys()).toContain('J')
      expect(hotkeys()).not.toContain('K')
      press('k')
      press('j')
      expect(host.calls).toEqual(['new key'])
      host.remove()
      expect(hotkeys()).toEqual([])
    })

    it('keeps the nearest decorated hotkey for an undecorated override', () => {
      const { DecoratedGrandchild } = runFixture(options)
      const host = mount(DecoratedGrandchild)
      press('k')
      press('j')
      expect(host.calls).toEqual(['grandchild'])
    })

    it('registers every decorator stacked on one method', () => {
      const { DecoratedStacked, DecoratedRestacked } = runFixture(options)
      const base = mount(DecoratedStacked)
      press('a')
      press('b')
      expect(base.calls).toEqual(['both', 'both'])
      base.remove()

      const sub = mount(DecoratedRestacked)
      expect(hotkeys().sort()).toEqual(['C', 'D'])
      press('a')
      press('c')
      press('d')
      expect(sub.calls).toEqual(['restacked', 'restacked'])
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

it('registers #private methods of a class and its subclass separately', () => {
  const { PrivateSub } = run(
    `
    import { LitElement } from 'lit'
    import { hotkey } from '../../src/decorators/hotkey'
    export class PrivateBase extends LitElement {
      calls = []
      @hotkey('P')
      #onKey() {
        this.calls.push('base')
      }
    }
    export class PrivateSub extends PrivateBase {
      @hotkey('Q')
      #onKey() {
        this.calls.push('sub')
      }
    }
    `,
    modes.standard,
  )
  const host = mount(PrivateSub!)
  press('p')
  press('q')
  expect(host.calls).toEqual(['base', 'sub'])
})

it('keeps stacked hotkeys when another decorator wraps the method between them', () => {
  const { Wrapped } = run(
    `
    import { LitElement } from 'lit'
    import { hotkey } from '../../src/decorators/hotkey'
    const wrap = (method) => function (...args) { return method.apply(this, args) }
    export class Wrapped extends LitElement {
      calls = []
      @hotkey('A')
      @wrap
      @hotkey('B')
      both() {
        this.calls.push('both')
      }
    }
    `,
    modes.standard,
  )
  const host = mount(Wrapped!)
  press('a')
  press('b')
  expect(host.calls).toEqual(['both', 'both'])
})
