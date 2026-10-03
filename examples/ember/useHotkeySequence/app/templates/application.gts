import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'

import { on } from '@ember/modifier'

import { useHotkeySequence, useHotkey } from '@tanstack/ember-hotkeys'
import type {
  HotkeySequence,
  SequenceOptions,
  HotkeyCallback,
} from '@tanstack/ember-hotkeys'
const gt = (a: number, b: number) => a > b

class App extends Component {
  usage0 =
    '{{useHotkeySequence (array "G" "G") this.scrollToTop}}\n{{useHotkeySequence\n  (array "ArrowUp" "ArrowUp" "ArrowDown" "ArrowDown")\n  this.activateCheatMode timeout=1500}}\n{{useHotkeySequence (array "C" "I" "W") this.changeInnerWord}}\n{{useHotkeySequence (array "Shift+[KeyR]" "Shift+[KeyT]") this.runChain}}'
  @tracked lastSequence: string | null = null
  @tracked history: Array<string> = []
  @tracked helloSequenceEnabled: boolean = true
  handleClick1 = () => (this.helloSequenceEnabled = !this.helloSequenceEnabled)
  handleClick2 = () => (this.history = [])
  addToHistory = (action: string) => {
    this.lastSequence = action
    this.history = [...this.history.slice(-9), action]
  }
  get sequence0(): HotkeySequence {
    return ['G', 'G']
  }
  on0: HotkeyCallback = () => this.addToHistory('gg → Go to top')
  get sequence1(): HotkeySequence {
    return ['Shift+G']
  }
  on1: HotkeyCallback = () => this.addToHistory('G → Go to bottom')
  get sequence2(): HotkeySequence {
    return ['D', 'D']
  }
  on2: HotkeyCallback = () => this.addToHistory('dd → Delete line')
  get sequence3(): HotkeySequence {
    return ['Y', 'Y']
  }
  on3: HotkeyCallback = () => this.addToHistory('yy → Yank (copy) line')
  get sequence4(): HotkeySequence {
    return ['D', 'W']
  }
  on4: HotkeyCallback = () => this.addToHistory('dw → Delete word')
  get sequence5(): HotkeySequence {
    return ['C', 'I', 'W']
  }
  on5: HotkeyCallback = () => this.addToHistory('ciw → Change inner word')
  get sequence6(): HotkeySequence {
    return ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown']
  }
  on6: HotkeyCallback = () => this.addToHistory('↑↑↓↓ → Konami code (partial)')
  get options6(): SequenceOptions {
    return { timeout: 1500 }
  }
  get sequence7(): HotkeySequence {
    return ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight']
  }
  on7: HotkeyCallback = () => this.addToHistory('←→←→ → Side to side!')
  get options7(): SequenceOptions {
    return { timeout: 1500 }
  }
  get sequence8(): HotkeySequence {
    return ['H', 'E', 'L', 'L', 'O']
  }
  on8: HotkeyCallback = () => this.addToHistory('hello → Hello World!')
  get options8(): SequenceOptions {
    return { enabled: this.helloSequenceEnabled }
  }
  get sequence9(): HotkeySequence {
    return ['Shift+[KeyR]', 'Shift+[KeyT]']
  }
  on9: HotkeyCallback = () =>
    this.addToHistory('⇧R ⇧T → Chained Shift+letter (2 steps)')
  onEscape: HotkeyCallback = () => {
    this.lastSequence = null
    this.history = []
  }

  <template>
    {{useHotkeySequence this.sequence0 this.on0}}
    {{useHotkeySequence this.sequence1 this.on1}}
    {{useHotkeySequence this.sequence2 this.on2}}
    {{useHotkeySequence this.sequence3 this.on3}}
    {{useHotkeySequence this.sequence4 this.on4}}
    {{useHotkeySequence this.sequence5 this.on5}}
    {{useHotkeySequence this.sequence6 this.on6 timeout=this.options6.timeout}}
    {{useHotkeySequence this.sequence7 this.on7 timeout=this.options7.timeout}}
    {{useHotkeySequence this.sequence8 this.on8 enabled=this.options8.enabled}}
    {{useHotkeySequence this.sequence9 this.on9}}
    {{useHotkey 'Escape' this.onEscape}}
    <div class='app'>
      <header>
        <h1>useHotkeySequence</h1>
        <p>
          Register multi-key sequences (like Vim commands). Keys must be pressed
          within the timeout window (default: 1000ms).
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
              <button type='button' {{on 'click' this.handleClick1}}>
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
            These steps use physical R and T positions (<code>[KeyR]</code>
            and
            <code>[KeyT]</code>), independent of the characters they produce. Hold
            <kbd>Shift</kbd>
            and press each position. You can press
            <kbd>Shift</kbd>
            alone between steps—those modifier-only presses do not reset progress,
            so the next chord still counts. Holding a key does not count as
            additional steps.
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

        <section class='demo-section'>
          <h2>Usage</h2>
          <pre class='code-block'>{{this.usage0}}</pre>
        </section>

        {{#if (gt this.history.length 0)}}<section class='demo-section'>
            <h2>History</h2>
            <ul class='history-list'>
              {{#each this.history as |item i|}}<li>{{item}}</li>{{/each}}
            </ul>
            <button {{on 'click' this.handleClick2}}>Clear History</button>
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
export default App
