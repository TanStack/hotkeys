import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'

import { on } from '@ember/modifier'
import { fn } from '@ember/helper'
import {
  formatForDisplay,
  useHotkeys,
  useHotkeyRegistrations,
} from '@tanstack/ember-hotkeys'
import type {
  Hotkey,
  HotkeyDefinition,
  HotkeyOptions,
} from '@tanstack/ember-hotkeys'
const eq = (a: unknown, b: unknown) => a === b
const neq = (a: unknown, b: unknown) => a !== b
const gt = (a: number, b: number) => a > b
const and = (a: unknown, b: unknown) => a && b
const or = <T, U>(a: T, b: U) => a || b
const not = (a: unknown) => !a
interface DynamicShortcut {
  id: number
  hotkey: string
  label: string
  description: string
  count: number
}

let nextId = 0

const DEFAULT_SHORTCUTS: Array<DynamicShortcut> = [
  {
    id: nextId++,
    hotkey: 'Shift+A',
    label: 'Action A',
    description: 'First dynamic action',
    count: 0,
  },
  {
    id: nextId++,
    hotkey: 'Shift+B',
    label: 'Action B',
    description: 'Second dynamic action',
    count: 0,
  },
  {
    id: nextId++,
    hotkey: 'Shift+C',
    label: 'Action C',
    description: 'Third dynamic action',
    count: 0,
  },
]

class App extends Component {
  <template>
    <div class='app'>
      <header>
        <h1>useHotkeys</h1>
        <p>
          Register multiple hotkeys in a single helper invocation. Supports dynamic
          arrays for variable-length shortcut lists.
        </p>
      </header>
      <BasicMultiHotkeys />
      <CommonOptionsDemo />
      <DynamicHotkeysDemo />
      <RegistrationsViewer />
    </div>
  </template>
}

class BasicMultiHotkeys extends Component {
  usage0 =
    "get definitions() {\n  return [\n    { hotkey: 'Shift+S', callback: this.save,\n      options: { meta: { name: 'Save', description: 'Save the document' } } },\n    { hotkey: 'Shift+U', callback: this.undo,\n      options: { meta: { name: 'Undo' } } },\n  ]\n}\n\n<template>{{useHotkeys this.definitions}}</template>"
  @tracked log: Array<string> = []
  @tracked saveCount: number = 0
  @tracked undoCount: number = 0
  @tracked redoCount: number = 0
  get hotkeyDefinitions(): Array<HotkeyDefinition> {
    return [
      {
        hotkey: 'Shift+S',
        callback: (_e, { hotkey }) => {
          this.saveCount = this.saveCount + 1
          this.log = [`${hotkey} pressed`, ...this.log].slice(0, 20)
        },
        options: {
          meta: { name: 'Save', description: 'Save the current document' },
        },
      },
      {
        hotkey: 'Shift+U',
        callback: (_e, { hotkey }) => {
          this.undoCount = this.undoCount + 1
          this.log = [`${hotkey} pressed`, ...this.log].slice(0, 20)
        },
        options: {
          meta: { name: 'Undo', description: 'Undo the last action' },
        },
      },
      {
        hotkey: 'Shift+R',
        callback: (_e, { hotkey }) => {
          this.redoCount = this.redoCount + 1
          this.log = [`${hotkey} pressed`, ...this.log].slice(0, 20)
        },
        options: {
          meta: { name: 'Redo', description: 'Redo the last undone action' },
        },
      },
    ]
  }

  <template>
    {{useHotkeys this.hotkeyDefinitions}}
    <div class='demo-section'>
      <h2>Basic Multi-Hotkey Registration</h2>
      <p>
        All three hotkeys are registered in a single
        <code>useHotkeys()</code>
        call with
        <code>meta</code>
        for name and description.
      </p>
      <div class='hotkey-grid'>
        <div>
          <kbd>{{formatForDisplay 'Shift+S'}}</kbd>
          Save ({{this.saveCount}})
        </div>
        <div>
          <kbd>{{formatForDisplay 'Shift+U'}}</kbd>
          Undo ({{this.undoCount}})
        </div>
        <div>
          <kbd>{{formatForDisplay 'Shift+R'}}</kbd>
          Redo ({{this.redoCount}})
        </div>
      </div>
      {{#if (gt this.log.length 0)}}<div class='log'>
          {{#each this.log as |entry i|}}<div class='log-entry'>
              {{entry}}
            </div>{{/each}}
        </div>{{/if}}
      <pre class='code-block'>{{this.usage0}}</pre>
    </div>
  </template>
}

class CommonOptionsDemo extends Component {
  usage0 =
    "get definitions() {\n  return [\n    { hotkey: 'Alt+J', callback: this.actionA },\n    { hotkey: 'Alt+L', callback: this.actionC, options: { enabled: true } },\n  ]\n}\n\n<template>{{useHotkeys this.definitions enabled=this.enabled}}</template>"
  @tracked enabled: boolean = true
  @tracked counts: { a: number; b: number; c: number } = { a: 0, b: 0, c: 0 }
  handleClick1 = () => (this.enabled = !this.enabled)
  get hotkeyDefinitions(): Array<HotkeyDefinition> {
    return [
      {
        hotkey: 'Alt+J',
        callback: () =>
          (this.counts = { ...this.counts, a: this.counts.a + 1 }),
        options: {
          meta: {
            name: 'Action A',
            description: 'First action (respects toggle)',
          },
        },
      },
      {
        hotkey: 'Alt+K',
        callback: () =>
          (this.counts = { ...this.counts, b: this.counts.b + 1 }),
        options: {
          meta: {
            name: 'Action B',
            description: 'Second action (respects toggle)',
          },
        },
      },
      {
        hotkey: 'Alt+L',
        callback: () =>
          (this.counts = { ...this.counts, c: this.counts.c + 1 }),
        options: {
          enabled: true,
          meta: {
            name: 'Action C',
            description: 'Always-on action (overrides toggle)',
          },
        },
      },
    ]
  }
  get options0(): HotkeyOptions {
    return { enabled: this.enabled }
  }

  <template>
    {{useHotkeys this.hotkeyDefinitions enabled=this.options0.enabled}}
    <div class='demo-section'>
      <h2>Common Options with Per-Hotkey Overrides</h2>
      <p>
        <kbd>{{formatForDisplay 'Alt+J'}}</kbd>
        and
        <kbd>{{formatForDisplay 'Alt+K'}}</kbd>
        respect the global toggle.
        <kbd>{{formatForDisplay 'Alt+L'}}</kbd>
        overrides
        <code>enabled: true</code>
        so it always works.
      </p>
      <div style='margin-bottom:12px'>
        <button {{on 'click' this.handleClick1}}>
          {{if this.enabled 'Disable' 'Enable'}}
          common hotkeys
        </button>
      </div>
      <div class='hotkey-grid'>
        <div>
          <kbd>{{formatForDisplay 'Alt+J'}}</kbd>
          Action A ({{this.counts.a}})
        </div>
        <div>
          <kbd>{{formatForDisplay 'Alt+K'}}</kbd>
          Action B ({{this.counts.b}})
        </div>
        <div>
          <kbd>{{formatForDisplay 'Alt+L'}}</kbd>
          Action C ({{this.counts.c}})
          <span class='hint'> (always on)</span>
        </div>
      </div>
      <pre class='code-block'>{{this.usage0}}</pre>
    </div>
  </template>
}

class DynamicHotkeysDemo extends Component {
  usage0 =
    'get definitions() {\n  return this.shortcuts.map((shortcut) => ({\n    hotkey: shortcut.hotkey,\n    callback: () => this.runShortcut(shortcut.id),\n    options: { meta: { name: shortcut.label, description: shortcut.description } },\n  }))\n}\n\n<template>{{useHotkeys this.definitions}}</template>'
  @tracked shortcuts: Array<DynamicShortcut> = DEFAULT_SHORTCUTS
  @tracked newHotkey: string = ''
  @tracked newLabel: string = ''
  @tracked newDescription: string = ''
  value1 = (s: DynamicShortcut) => s.hotkey as Hotkey
  handleClick2 = (s: DynamicShortcut) => this.removeShortcut(s.id)
  handleInput3 = (e: Event) =>
    (this.newHotkey = (e.currentTarget as HTMLInputElement).value)
  handleKeydown4 = (e: KeyboardEvent) => {
    if (e.key === 'Enter') this.addShortcut()
  }
  handleInput5 = (e: Event) =>
    (this.newLabel = (e.currentTarget as HTMLInputElement).value)
  handleKeydown6 = (e: KeyboardEvent) => {
    if (e.key === 'Enter') this.addShortcut()
  }
  handleInput7 = (e: Event) =>
    (this.newDescription = (e.currentTarget as HTMLInputElement).value)
  handleKeydown8 = (e: KeyboardEvent) => {
    if (e.key === 'Enter') this.addShortcut()
  }
  get definitions(): Array<HotkeyDefinition> {
    return this.shortcuts.map((s) => ({
      hotkey: s.hotkey as Hotkey,
      callback: () => {
        this.shortcuts = this.shortcuts.map((item) =>
          item.id === s.id ? { ...item, count: item.count + 1 } : item,
        )
      },
      options: {
        meta: { name: s.label, description: s.description },
      },
    }))
  }
  get hotkeyDefinitions(): Array<HotkeyDefinition> {
    return this.definitions
  }
  addShortcut = () => {
    const trimmed = this.newHotkey.trim()
    if (!trimmed || !this.newLabel.trim()) return
    this.shortcuts = [
      ...this.shortcuts,
      {
        id: nextId++,
        hotkey: trimmed,
        label: this.newLabel.trim(),
        description: this.newDescription.trim(),
        count: 0,
      },
    ]
    this.newHotkey = ''
    this.newLabel = ''
    this.newDescription = ''
  }
  removeShortcut = (id: number) => {
    this.shortcuts = this.shortcuts.filter((s) => s.id !== id)
  }

  <template>
    {{useHotkeys this.hotkeyDefinitions}}
    <div class='demo-section'>
      <h2>Dynamic Hotkey List</h2>
      <p>
        Add or remove hotkeys at runtime. Because
        <code>useHotkeys</code>
        accepts a dynamic array, this is safe without breaking the registration
        lifecycle.
      </p>
      <div class='dynamic-list'>
        {{#each this.shortcuts key='id' as |s|}}<div class='dynamic-item'>
            <kbd>{{formatForDisplay (this.value1 s)}}</kbd>
            <span>{{s.label}}</span>
            <span class='count'>{{s.count}}</span>
            <button {{on 'click' (fn this.handleClick2 s)}}>Remove</button>
          </div>{{/each}}
        {{#if (eq this.shortcuts.length 0)}}<p class='hint'>No shortcuts registered.
            Add one below.</p>{{/if}}
      </div>
      <div class='add-form'>
        <input
          type='text'
          placeholder='Hotkey (e.g. Shift+D)'
          value={{this.newHotkey}}
          {{on 'input' this.handleInput3}}
          {{on 'keydown' this.handleKeydown4}}
        />
        <input
          type='text'
          placeholder='Name (e.g. Action D)'
          value={{this.newLabel}}
          {{on 'input' this.handleInput5}}
          {{on 'keydown' this.handleKeydown6}}
        />
        <input
          type='text'
          placeholder='Description (optional)'
          value={{this.newDescription}}
          {{on 'input' this.handleInput7}}
          {{on 'keydown' this.handleKeydown8}}
        />
        <button
          {{on 'click' this.addShortcut}}
          disabled={{or (not this.newHotkey) (not this.newLabel)}}
        >
          Add
        </button>
      </div>
      <pre class='code-block'>{{this.usage0}}</pre>
    </div>
  </template>
}

class RegistrationsViewer extends Component {
  usage0 =
    'registrations = useHotkeyRegistrations(this)\n\n<template>\n  {{#each this.registrations.hotkeys key="id" as |registration|}}\n    <p>{{registration.options.meta.name}}: {{registration.triggerCount}}</p>\n  {{/each}}\n</template>'
  registrationState0 = useHotkeyRegistrations(this)
  get hotkeys() {
    return this.registrationState0.hotkeys
  }
  get sequences() {
    return this.registrationState0.sequences
  }

  <template>
    <div class='demo-section'>
      <h2>Live Registrations (useHotkeyRegistrations)</h2>
      <p>
        This table is rendered from
        <code>useHotkeyRegistrations()</code>
        — a reactive view of all registered hotkeys. It updates automatically as
        hotkeys are added, removed, enabled/disabled, or triggered.
      </p>
      <table class='registrations-table'>
        <thead>
          <tr>
            <th>Hotkey</th>
            <th>Name</th>
            <th>Description</th>
            <th>Enabled</th>
            <th>Triggers</th>
          </tr>
        </thead>
        <tbody>
          {{#each this.hotkeys key='id' as |reg|}}<tr>
              <td>
                <kbd>{{formatForDisplay reg.hotkey}}</kbd>
              </td>
              <td>{{or reg.options.meta.name '—'}}</td>
              <td class='description-cell'>
                {{or reg.options.meta.description '—'}}
              </td>
              <td>
                <span
                  class={{if
                    (neq reg.options.enabled false)
                    'status-on'
                    'status-off'
                  }}
                >
                  {{if (neq reg.options.enabled false) 'yes' 'no'}}
                </span>
              </td>
              <td class='trigger-count'>{{reg.triggerCount}}</td>
            </tr>{{/each}}
          {{#if (eq this.hotkeys.length 0)}}<tr>
              <td colspan={{5}} class='hint'>
                No hotkeys registered
              </td>
            </tr>{{/if}}
        </tbody>
      </table>
      {{#if (gt this.sequences.length 0)}}
        <h3 style='margin-top:16px'>Sequences</h3>
        <table class='registrations-table'>
          <thead>
            <tr>
              <th>Sequence</th>
              <th>Name</th>
              <th>Description</th>
              <th>Triggers</th>
            </tr>
          </thead>
          <tbody>
            {{#each this.sequences key='id' as |reg|}}<tr>
                <td>
                  {{#each reg.sequence as |s i|}}
                    {{and (gt i 0) ' '}}
                    <kbd>{{formatForDisplay s}}</kbd>
                  {{/each}}
                </td>
                <td>{{or reg.options.meta.name '—'}}</td>
                <td class='description-cell'>
                  {{or reg.options.meta.description '—'}}
                </td>
                <td class='trigger-count'>{{reg.triggerCount}}</td>
              </tr>{{/each}}
          </tbody>
        </table>
      {{/if}}
      <pre class='code-block'>{{this.usage0}}</pre>
    </div>
  </template>
}
export default App
