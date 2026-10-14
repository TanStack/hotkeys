import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'

import { on } from '@ember/modifier'

import {
  formatForDisplay,
  useHotkeys,
  useHotkey,
  useHotkeyRegistrations,
} from '@tanstack/ember-hotkeys'
import type {
  Hotkey,
  EmberHotkeyDefinition,
  HotkeyRegistrationView,
  HotkeyCallback,
} from '@tanstack/ember-hotkeys'
const eq = (a: unknown, b: unknown) => a === b
const neq = (a: unknown, b: unknown) => a !== b
const gt = (a: number, b: number) => a > b
const and = (a: unknown, b: unknown) => a && b
const or = <T, U>(a: T, b: U) => a || b

const progress = (reg: HotkeyRegistrationView) =>
  reg.kind === 'sequence'
    ? `${reg.matchedStepCount}/${reg.hotkey.length}`
    : '\u2014'

class App extends Component {
  usage0 =
    "get definitions() {\n  return [\n    { hotkey: ['G', 'G'], callback: this.scrollToTop,\n      options: { meta: { name: 'Go to top' } } },\n    { hotkey: ['C', 'I', 'W'], callback: this.changeInnerWord,\n      options: { meta: { name: 'Change inner word' } } },\n  ]\n}\nregistrations = useHotkeyRegistrations(this)\n\n<template>{{useHotkeys this.definitions}}</template>"
  @tracked lastSequence: string | null = null
  @tracked history: Array<string> = []
  @tracked helloSequenceEnabled: boolean = true
  toggleHello = () => (this.helloSequenceEnabled = !this.helloSequenceEnabled)
  clearHistory = () => (this.history = [])
  addToHistory = (action: string) => {
    this.lastSequence = action
    this.history = [...this.history.slice(-9), action]
  }
  get sequenceDefinitions(): Array<EmberHotkeyDefinition> {
    return [
      {
        hotkey: ['G', 'G'],
        callback: () => this.addToHistory('gg → Go to top'),
        options: {
          meta: {
            name: 'Go to top',
            description: 'Scroll to the beginning of the document',
          },
        },
      },
      {
        hotkey: ['Shift+G'],
        callback: () => this.addToHistory('G → Go to bottom'),
        options: {
          meta: {
            name: 'Go to bottom',
            description: 'Scroll to the end of the document',
          },
        },
      },
      {
        hotkey: ['D', 'D'],
        callback: () => this.addToHistory('dd → Delete line'),
        options: {
          meta: { name: 'Delete line', description: 'Delete the current line' },
        },
      },
      {
        hotkey: ['Y', 'Y'],
        callback: () => this.addToHistory('yy → Yank (copy) line'),
        options: {
          meta: {
            name: 'Yank line',
            description: 'Copy the current line to clipboard',
          },
        },
      },
      {
        hotkey: ['D', 'W'],
        callback: () => this.addToHistory('dw → Delete word'),
        options: {
          meta: {
            name: 'Delete word',
            description: 'Delete from cursor to end of word',
          },
        },
      },
      {
        hotkey: ['C', 'I', 'W'],
        callback: () => this.addToHistory('ciw → Change inner word'),
        options: {
          meta: {
            name: 'Change inner word',
            description: 'Delete word under cursor and enter insert mode',
          },
        },
      },
      {
        hotkey: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
        callback: () => this.addToHistory('↑↑↓↓ → Konami code (partial)'),
        options: {
          timeout: 1500,
          meta: {
            name: 'Konami code',
            description: 'Partial Konami code using arrow keys',
          },
        },
      },
      {
        hotkey: ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'],
        callback: () => this.addToHistory('←→←→ → Side to side!'),
        options: {
          timeout: 1500,
          meta: {
            name: 'Side to side',
            description: 'Left-right-left-right arrow pattern',
          },
        },
      },
      {
        hotkey: ['H', 'E', 'L', 'L', 'O'],
        callback: () => this.addToHistory('hello → Hello World!'),
        options: {
          enabled: this.helloSequenceEnabled,
          meta: { name: 'Hello', description: 'Spell out hello to trigger' },
        },
      },
      {
        hotkey: ['Shift+R', 'Shift+T'],
        callback: () =>
          this.addToHistory('⇧R ⇧T → Chained Shift+letter (2 steps)'),
        options: {
          meta: {
            name: 'Chained Shift',
            description: 'Two consecutive Shift+letter chords',
          },
        },
      },
    ]
  }
  onEscape: HotkeyCallback = () => {
    this.lastSequence = null
    this.history = []
  }

  <template>
    {{useHotkeys this.sequenceDefinitions}}
    {{useHotkey 'Escape' this.onEscape}}
    <div class='app'>
      <header>
        <h1>Sequences with useHotkeys</h1>
        <p>
          Register many multi-key sequences in one
          <code>useHotkeys</code>
          call by passing arrays of chords (like Vim commands). Keys must be
          pressed within the timeout window (default: 1000ms).
        </p>
      </header>

      <main>
        <section class='demo-section'>
          <h2>Vim-Style Commands</h2>
          <table class='sequence-table'>
            <thead>
              <tr>
                <th>Sequence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <kbd>g</kbd>
                  <kbd>g</kbd>
                </td>
                <td>Go to top</td>
              </tr>
              <tr>
                <td>
                  <kbd>G</kbd>
                  (Shift+G)
                </td>
                <td>Go to bottom</td>
              </tr>
              <tr>
                <td>
                  <kbd>d</kbd>
                  <kbd>d</kbd>
                </td>
                <td>Delete line</td>
              </tr>
              <tr>
                <td>
                  <kbd>y</kbd>
                  <kbd>y</kbd>
                </td>
                <td>Yank (copy) line</td>
              </tr>
              <tr>
                <td>
                  <kbd>d</kbd>
                  <kbd>w</kbd>
                </td>
                <td>Delete word</td>
              </tr>
              <tr>
                <td>
                  <kbd>c</kbd>
                  <kbd>i</kbd>
                  <kbd>w</kbd>
                </td>
                <td>Change inner word</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class='demo-section'>
          <h2>Fun Sequences</h2>
          <div class='fun-sequences'>
            <div class='sequence-card'>
              <h3>Konami Code (Partial)</h3>
              <p>
                <kbd>↑</kbd>
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                <kbd>↓</kbd>
              </p>
              <span class='hint'>Use arrow keys within 1.5 seconds</span>
            </div>
            <div class='sequence-card'>
              <h3>Side to Side</h3>
              <p>
                <kbd>←</kbd>
                <kbd>→</kbd>
                <kbd>←</kbd>
                <kbd>→</kbd>
              </p>
              <span class='hint'>Arrow keys within 1.5 seconds</span>
            </div>
            <div class='sequence-card'>
              <h3>Spell It Out</h3>
              <p>
                <kbd>h</kbd>
                <kbd>e</kbd>
                <kbd>l</kbd>
                <kbd>l</kbd>
                <kbd>o</kbd>
              </p>
              <span class='hint'>Type "hello" quickly</span>
              <p class='sequence-toggle-status'>
                This sequence is
                <strong>{{if
                    this.helloSequenceEnabled
                    'enabled'
                    'disabled'
                  }}</strong>
                .
              </p>
              <button type='button' {{on 'click' this.toggleHello}}>
                {{if this.helloSequenceEnabled 'Disable' 'Enable'}}
                sequence
              </button>
            </div>
          </div>
        </section>

        {{#if this.lastSequence}}<div class='info-box success'>
            <strong>Triggered:</strong>
            {{this.lastSequence}}
          </div>{{/if}}

        <section class='demo-section'>
          <h2>Input handling</h2>
          <p>
            Sequences are not detected when typing in text inputs, textareas,
            selects, or contenteditable elements. Button-type inputs (
            <code>type="button"</code>,
            <code>submit</code>,
            <code>reset</code>) still receive sequences. Focus the input below and
            try
            <kbd>g</kbd>
            <kbd>g</kbd>
            or
            <kbd>h</kbd>
            <kbd>e</kbd>
            <kbd>l</kbd>
            <kbd>l</kbd>
            <kbd>o</kbd>
            — nothing will trigger. Click outside to try again.
          </p>
          <input
            type='text'
            class='demo-input'
            placeholder="Focus here – sequences won't trigger while typing..."
          />
        </section>

        <section class='demo-section'>
          <h2>Chained Shift+letter sequences</h2>
          <p>
            Each step is a chord: hold
            <kbd>Shift</kbd>
            and press a letter. You can press
            <kbd>Shift</kbd>
            alone between steps—those modifier-only presses do not reset progress,
            so the next chord still counts.
          </p>
          <table class='sequence-table'>
            <thead>
              <tr>
                <th>Sequence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <kbd>Shift</kbd>+<kbd>r</kbd>
                  then
                  <kbd>Shift</kbd>+
                  <kbd>t</kbd>
                </td>
                <td>Chained Shift+letter (2 steps)</td>
              </tr>
            </tbody>
          </table>
        </section>

        <RegistrationsViewer />

        <section class='demo-section'>
          <h2>Usage</h2>
          <pre class='code-block'>{{this.usage0}}</pre>
        </section>

        {{#if (gt this.history.length 0)}}<section class='demo-section'>
            <h2>History</h2>
            <ul class='history-list'>
              {{#each this.history as |item i|}}<li>{{item}}</li>{{/each}}
            </ul>
            <button {{on 'click' this.clearHistory}}>Clear History</button>
          </section>{{/if}}

        <p class='hint'>
          Press
          <kbd>Escape</kbd>
          to clear history
        </p>
      </main>

    </div>
  </template>
}

class RegistrationsViewer extends Component {
  registrationsState = useHotkeyRegistrations(this)
  get hotkeys() {
    return this.registrationsState.hotkeys
  }
  <template>
    <section class='demo-section'>
      <h2>Live Registrations (useHotkeyRegistrations)</h2>
      <p>
        This table is rendered from
        <code>useHotkeyRegistrations()</code>
        — a reactive view of all registered hotkeys and sequences. Progress and
        trigger counts update in real-time.
      </p>

      <table class='registrations-table'>
        <thead>
          <tr>
            <th>Hotkey</th>
            <th>Name</th>
            <th>Description</th>
            <th>Progress</th>
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
              <td>{{progress reg}}</td>
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
              <td colspan={{6}} class='hint'>
                No hotkeys registered
              </td>
            </tr>{{/if}}
        </tbody>
      </table>
    </section>
  </template>
}
export default App
