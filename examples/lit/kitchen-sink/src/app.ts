import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import {
  HeldKeyCodesController,
  HeldKeysController,
  HotkeyController,
  HotkeyHintController,
  HotkeyRecorderController,
  HotkeyRegistrationsController,
  HotkeySequenceController,
  HotkeySequenceRecorderController,
  KeyHoldController,
  formatForDisplay,
  getHotkeyManager,
  getSequenceManager,
  hotkey,
} from '@tanstack/lit-hotkeys'
import type {
  Hotkey,
  HotkeyRegistrationHandle,
  HotkeySequence,
  RecorderKeyMode,
  SequenceRegistrationHandle,
} from '@tanstack/lit-hotkeys'
import './styles.css'

// Light DOM keeps the shared example CSS small and makes scoped targets easy to inspect.
class DemoElement extends LitElement {
  protected createRenderRoot() {
    return this
  }
  protected log(message: string) {
    this.dispatchEvent(
      new CustomEvent('activity', {
        detail: message,
        bubbles: true,
        composed: true,
      }),
    )
  }
}

@customElement('shortcut-hint')
class Hint extends DemoElement {
  @property() hotkey: Hotkey = 'Escape'
  @property({ type: Boolean }) enabled = true
  private hint = new HotkeyHintController(this, () => this.hotkey)
  render() {
    return this.hint.value && this.enabled
      ? html`<kbd>${formatForDisplay(this.hotkey)}</kbd>`
      : null
  }
}

@customElement('ticket-demo')
class Tickets extends DemoElement {
  @state() private count = 0
  @state() private enabled = true
  private bindings: Array<HotkeyRegistrationHandle> = []
  private create = () => {
    this.count++
    this.log('Ticket created')
  }
  private save = () => this.log('Ticket saved')
  connectedCallback() {
    super.connectedCallback()
    this.bindings = [
      getHotkeyManager().register('Alt+[KeyC]', this.create, {
        enabled: this.enabled,
        requireReset: true,
        ignoreInputs: false,
        meta: { name: 'Create ticket', group: 'Tickets' },
      }),
      getHotkeyManager().register('Alt+[KeyS]', this.save, {
        enabled: this.enabled,
        requireReset: true,
        meta: { name: 'Save ticket', group: 'Tickets' },
      }),
    ]
  }
  disconnectedCallback() {
    this.bindings.forEach((h) => h.unregister())
    super.disconnectedCallback()
  }
  private toggle = (event: Event) => {
    this.enabled = (event.target as HTMLInputElement).checked
    this.bindings.forEach((h) => h.setOptions({ enabled: this.enabled }))
  }
  render() {
    return html`<section>
      <h2>Tickets</h2>
      <p>Created: ${this.count}. Buttons and shortcuts share handlers.</p>
      <label
        ><input
          type="checkbox"
          .checked=${this.enabled}
          @change=${this.toggle}
        />
        Enable ticket actions</label
      >
      <button ?disabled=${!this.enabled} @click=${this.create}>
        Create ticket
        <shortcut-hint
          hotkey="Alt+[KeyC]"
          .enabled=${this.enabled}
        ></shortcut-hint>
      </button>
      <button ?disabled=${!this.enabled} @click=${this.save}>
        Save pending
        <shortcut-hint
          hotkey="Alt+[KeyS]"
          .enabled=${this.enabled}
        ></shortcut-hint>
      </button>
      <label
        >Ticket note <input placeholder="Try Alt + C while typing"
      /></label>
      <p>
        Create uses ignoreInputs: false; Save uses default filtering. Release
        before firing again.
      </p>
    </section>`
  }
}

@customElement('editor-pane')
class EditorPane extends DemoElement {
  @property() name = 'Editor'
  @state() private text = 'One shortcut, two independent editors.'
  @state() private saves = 0
  constructor() {
    super()
    this.addController(
      new HotkeyController(
        this,
        'Mod+[KeyS]',
        () => {
          this.saves++
          this.log(`${this.name} saved`)
        },
        {
          target: this,
          ignoreInputs: false,
          requireReset: true,
          meta: { name: 'Save editor', group: 'Editor' },
        },
      ),
    )
    this.addController(
      new HotkeyController(
        this,
        'Alt+[Backspace]',
        () => {
          this.text = ''
        },
        {
          target: this,
          ignoreInputs: false,
          meta: { name: 'Clear editor', group: 'Editor' },
        },
      ),
    )
  }
  render() {
    return html`<fieldset>
      <legend>${this.name} — ${this.saves} saves</legend>
      <label
        >Editor content<textarea
          rows="3"
          .value=${this.text}
          @input=${(e: Event) => {
            this.text = (e.target as HTMLTextAreaElement).value
          }}
        ></textarea>
      </label>
      <p>
        <kbd>${formatForDisplay('Mod+[KeyS]')}</kbd> Save;
        <kbd>${formatForDisplay('Alt+[Backspace]')}</kbd> Clear
      </p>
    </fieldset>`
  }
}

@customElement('editor-demo')
class Editor extends DemoElement {
  @state() private count = 0
  @state() private repeat = false
  @state() private bubble = false
  private counter?: HotkeyRegistrationHandle
  private scoped?: HotkeyRegistrationHandle
  @hotkey('Alt+[KeyU]', {
    eventType: 'keyup',
    meta: { name: 'Keyup', group: 'Editor' },
  })
  released() {
    this.log('Keyup U')
  }
  @hotkey('Alt+[KeyB]', {
    meta: { name: 'Document propagation', group: 'Editor' },
  })
  documentB() {
    this.log('Document B')
  }
  firstUpdated() {
    this.counter = getHotkeyManager().register(
      'Alt+[ArrowRight]',
      () => this.count++,
      { requireReset: true, meta: { name: 'Counter', group: 'Editor' } },
    )
    this.scoped = getHotkeyManager().register(
      'Alt+[KeyB]',
      () => this.log('Scoped B'),
      {
        target: this.querySelector<HTMLElement>('#scope')!,
        meta: { name: 'Scoped propagation', group: 'Editor' },
      },
    )
  }
  disconnectedCallback() {
    this.counter?.unregister()
    this.scoped?.unregister()
    super.disconnectedCallback()
  }
  render() {
    return html`<section>
      <h2>Editor scopes</h2>
      <p>Focus an editor to choose its Save handler.</p>
      <editor-pane name="Draft"></editor-pane
      ><editor-pane name="Notes"></editor-pane>
      <label
        ><input
          type="checkbox"
          .checked=${this.repeat}
          @change=${(e: Event) => {
            this.repeat = (e.target as HTMLInputElement).checked
            this.counter?.setOptions({ requireReset: !this.repeat })
          }}
        />
        Allow repeat</label
      >
      <p>
        Hold Alt + ArrowRight: ${this.count}. Release Alt + U for a keyup event.
      </p>
      <fieldset id="scope" tabindex="0">
        <legend>Propagation</legend>
        <label
          ><input
            type="checkbox"
            .checked=${this.bubble}
            @change=${(e: Event) => {
              this.bubble = (e.target as HTMLInputElement).checked
              this.scoped?.setOptions({
                preventDefault: !this.bubble,
                stopPropagation: !this.bubble,
              })
            }}
          />
          Allow bubbling and browser defaults</label
        >
        <p>Focus here and press Alt + B; watch Activity.</p>
        <button
          @click=${() => this.querySelector<HTMLElement>('#scope')?.focus()}
        >
          Focus this area
        </button>
      </fieldset>
    </section>`
  }
}

@customElement('sequence-demo')
class Sequences extends DemoElement {
  @state() private timeout = 1000
  private registry = new HotkeyRegistrationsController(this)
  private handles: Array<SequenceRegistrationHandle> = []
  constructor() {
    super()
    this.addController(
      new HotkeySequenceController(
        this,
        ['Shift+[KeyR]', 'Shift+[KeyT]'],
        () => this.log('Shift chain'),
        { meta: { name: 'Shift chain (1000ms)', group: 'Sequences' } },
      ),
    )
  }
  connectedCallback() {
    super.connectedCallback()
    this.handles = [
      getSequenceManager().register(
        ['[KeyG]', '[KeyG]'],
        () => this.log('Go to top'),
        {
          timeout: this.timeout,
          meta: { name: 'Go to top', group: 'Sequences' },
        },
      ),
      getSequenceManager().register(
        ['[KeyG]', '[KeyI]'],
        () => this.log('Inbox'),
        { timeout: this.timeout, meta: { name: 'Inbox', group: 'Sequences' } },
      ),
    ]
  }
  disconnectedCallback() {
    this.handles.forEach((h) => h.unregister())
    super.disconnectedCallback()
  }
  render() {
    return html`<section>
      <h2>Sequences</h2>
      <p>
        Physical G then G, G then I, or Shift + R then Shift + T. Repeats do not
        advance steps.
      </p>
      <label
        >G sequence timeout: ${this.timeout} ms
        <input
          type="range"
          min="300"
          max="2500"
          step="100"
          .value=${String(this.timeout)}
          @input=${(e: Event) => {
            this.timeout = Number((e.target as HTMLInputElement).value)
            this.handles.forEach((h) => h.setOptions({ timeout: this.timeout }))
          }}
      /></label>
      <table>
        <tbody>
          ${this.registry.sequences.map(
            (reg) =>
              html`<tr>
                <td>${reg.options.meta?.name}</td>
                <td>
                  ${reg.sequence.map((h) => formatForDisplay(h)).join(' → ')}
                </td>
                <td>
                  ${reg.matchedStepCount}/${reg.sequence.length} steps;
                  ${reg.triggerCount} fired
                </td>
              </tr>`,
          )}
        </tbody>
      </table>
    </section>`
  }
}

@customElement('recording-demo')
class Recording extends DemoElement {
  private initial: Hotkey = 'Alt+[KeyR]'
  @state() private binding: Hotkey = this.initial
  @state() private sequence: HotkeySequence = ['[KeyX]', '[KeyY]']
  @state() private mode: RecorderKeyMode = 'code'
  @state() private problem = ''
  @state() private idle = false
  @state() private enter = true
  private shortcut?: HotkeyRegistrationHandle
  private sequenceHandle?: SequenceRegistrationHandle
  private recorder = new HotkeyRecorderController(this, {
    ignoreInputs: false,
    detectConflicts: {
      exclude: (reg) => reg.options.meta?.name === 'Recorded action',
    },
    validate: (_, { parsedHotkey }) =>
      parsedHotkey.modifiers.length > 0 || 'Include a modifier.',
    onRecord: (value) => {
      this.binding = value
      this.registerShortcut()
      this.problem = ''
    },
    onClear: () => {
      this.binding = this.initial
      this.registerShortcut()
    },
    onReject: (r) => {
      this.problem = r.message
    },
    onCancel: () => {
      this.problem = 'Cancelled'
    },
  })
  private seq = new HotkeySequenceRecorderController(this, {
    ignoreInputs: false,
    detectConflicts: {
      exclude: (reg) => reg.options.meta?.name === 'Recorded sequence',
    },
    validate: (steps) => steps.length >= 2 || 'Record at least two chords.',
    onRecord: (value) => {
      this.sequence = value
      this.registerSequence()
      this.problem = ''
    },
    onClear: () => {
      this.sequence = ['[KeyX]', '[KeyY]']
      this.registerSequence()
    },
    onReject: (r) => {
      this.problem = r.message
    },
    onCancel: () => {
      this.problem = 'Cancelled'
    },
  })
  private registerShortcut() {
    this.shortcut?.unregister()
    this.shortcut = getHotkeyManager().register(
      this.binding,
      () => this.log('Recorded shortcut fired'),
      {
        requireReset: true,
        meta: { name: 'Recorded action', group: 'Recording' },
      },
    )
  }
  private registerSequence() {
    this.sequenceHandle?.unregister()
    this.sequenceHandle = getSequenceManager().register(
      this.sequence,
      () => this.log('Recorded sequence fired'),
      { meta: { name: 'Recorded sequence', group: 'Recording' } },
    )
  }
  connectedCallback() {
    super.connectedCallback()
    this.registerShortcut()
    this.registerSequence()
  }
  disconnectedCallback() {
    this.shortcut?.unregister()
    this.sequenceHandle?.unregister()
    super.disconnectedCallback()
  }
  render() {
    return html`<section>
      <h2>Recording</h2>
      <p>Bindings live in route state. Try Alt + 1 for a conflict.</p>
      <label
        >Record by
        <select
          .value=${this.mode}
          ?disabled=${this.recorder.isRecording || this.seq.isRecording}
          @change=${(e: Event) => {
            this.mode = (e.target as HTMLSelectElement).value as RecorderKeyMode
            this.recorder.setOptions({ recordBy: this.mode })
            this.seq.setOptions({ recordBy: this.mode })
          }}
        >
          <option value="code">Physical code</option>
          <option value="key">Logical key</option>
        </select></label
      >
      <h3>Single shortcut</h3>
      <p>
        <kbd>${formatForDisplay(this.binding)}</kbd> —
        <code>${this.binding}</code>
      </p>
      <button
        ?disabled=${this.recorder.isRecording || this.seq.isRecording}
        @click=${() => this.recorder.startRecording()}
      >
        Record shortcut</button
      ><button
        @click=${() => {
          this.recorder.stopRecording()
          this.binding = this.initial
          this.registerShortcut()
        }}
      >
        Reset</button
      >${this.recorder.isRecording
        ? html`<button @click=${() => this.recorder.cancelRecording()}>
            Cancel
          </button>`
        : null}
      <h3>Sequence</h3>
      <p>
        ${(this.seq.isRecording ? this.seq.steps : this.sequence)
          .map((h) => formatForDisplay(h))
          .join(' → ')}
      </p>
      <label
        ><input
          type="checkbox"
          .checked=${this.idle}
          @change=${(e: Event) => {
            this.idle = (e.target as HTMLInputElement).checked
            this.seq.setOptions({ idleTimeoutMs: this.idle ? 1500 : undefined })
          }}
        />
        Commit after 1.5 seconds idle</label
      >
      <label
        ><input
          type="checkbox"
          .checked=${this.enter}
          @change=${(e: Event) => {
            this.enter = (e.target as HTMLInputElement).checked
            this.seq.setOptions({ commitKeys: this.enter ? 'enter' : 'none' })
          }}
        />
        Enter commits</label
      >
      <button
        ?disabled=${this.recorder.isRecording || this.seq.isRecording}
        @click=${() => this.seq.startRecording()}
      >
        Record sequence</button
      ><button
        ?disabled=${!this.seq.isRecording || !this.seq.steps.length}
        @click=${() => this.seq.commitRecording()}
      >
        Commit</button
      >${this.seq.isRecording
        ? html`<button @click=${() => this.seq.cancelRecording()}>
            Cancel
          </button>`
        : null}
      <p>
        Backspace removes a step or restores the initial binding when empty.
        Rejected steps remain editable.
      </p>
      <p role="status">${this.problem}</p>
    </section>`
  }
}

@customElement('format-demo')
class Formatting extends DemoElement {
  @state() private platform: 'mac' | 'windows' | 'linux' = 'mac'
  @state() private modifiers = false
  @state() private keys = true
  render() {
    const options = {
      platform: this.platform,
      useSymbols: { modifiers: this.modifiers, keys: this.keys },
    }
    return html`<section>
      <h2>Formatting</h2>
      <label
        >Platform
        <select
          .value=${this.platform}
          @change=${(e: Event) => {
            this.platform = (e.target as HTMLSelectElement)
              .value as typeof this.platform
          }}
        >
          <option value="mac">macOS</option>
          <option value="windows">Windows</option>
          <option value="linux">Linux</option>
        </select></label
      >
      <label
        ><input
          type="checkbox"
          .checked=${this.modifiers}
          @change=${(e: Event) => {
            this.modifiers = (e.target as HTMLInputElement).checked
          }}
        />
        Modifier symbols</label
      ><label
        ><input
          type="checkbox"
          .checked=${this.keys}
          @change=${(e: Event) => {
            this.keys = (e.target as HTMLInputElement).checked
          }}
        />
        Key symbols</label
      >
      <table>
        <thead>
          <tr>
            <th>Binding</th>
            <th>String</th>
            <th>Parts</th>
          </tr>
        </thead>
        <tbody>
          ${(
            [
              'Mod+Shift+ArrowUp',
              'Control++',
              'Alt+[KeyS]',
              'Mod+[NumpadAdd]',
            ] as const
          ).map(
            (binding) =>
              html`<tr>
                <td><code>${binding}</code></td>
                <td>${formatForDisplay(binding, options)}</td>
                <td>
                  ${formatForDisplay(binding, { ...options, parts: true }).map(
                    (part) => html`<kbd>${part}</kbd>`,
                  )}
                </td>
              </tr>`,
          )}
        </tbody>
      </table>
      <p>
        Supply layoutMap or keyLabels for layout labels. Formatting never
        changes binding identity.
      </p>
    </section>`
  }
}

@customElement('my-app')
class App extends DemoElement {
  private pages = [
    { path: '/', name: 'Tickets', hotkey: 'Alt+[Digit1]' },
    { path: '/editor', name: 'Editor', hotkey: 'Alt+[Digit2]' },
    { path: '/sequences', name: 'Sequences', hotkey: 'Alt+[Digit3]' },
    { path: '/recording', name: 'Recording', hotkey: 'Alt+[Digit4]' },
    { path: '/formatting', name: 'Formatting', hotkey: 'Alt+[Digit5]' },
  ] as const
  @state() private path = location.hash.slice(1) || '/'
  @state() private show = false
  @state() private activity: Array<string> = []
  private keys = new HeldKeysController(this)
  private codes = new HeldKeyCodesController(this)
  private shift = new KeyHoldController(this, 'Shift')
  private registry = new HotkeyRegistrationsController(this)
  private updatePath = () => {
    this.path = location.hash.slice(1) || '/'
  }
  constructor() {
    super()
    for (const page of this.pages)
      this.addController(
        new HotkeyController(
          this,
          page.hotkey,
          () => {
            location.hash = page.path
          },
          {
            ignoreInputs: true,
            requireReset: true,
            meta: { name: page.name, group: 'Navigation' },
          },
        ),
      )
    this.addController(
      new HotkeyController(
        this,
        'Alt+Shift+[KeyK]',
        () => {
          this.show = !this.show
        },
        {
          requireReset: true,
          meta: { name: 'Show shortcuts', group: 'Navigation' },
        },
      ),
    )
  }
  connectedCallback() {
    super.connectedCallback()
    window.addEventListener('hashchange', this.updatePath)
  }
  disconnectedCallback() {
    window.removeEventListener('hashchange', this.updatePath)
    super.disconnectedCallback()
  }
  private route() {
    switch (this.path) {
      case '/editor':
        return html`<editor-demo></editor-demo>`
      case '/sequences':
        return html`<sequence-demo></sequence-demo>`
      case '/recording':
        return html`<recording-demo></recording-demo>`
      case '/formatting':
        return html`<format-demo></format-demo>`
      default:
        return html`<ticket-demo></ticket-demo>`
    }
  }
  render() {
    return html`<header>
        <h1>TanStack Hotkeys kitchen sink</h1>
        <p>
          Hold Alt / Option for hints. Route changes mount and unmount
          registrations.
        </p>
        <nav>
          ${this.pages.map(
            (page) =>
              html`<a
                href=${`#${page.path}`}
                class=${this.path === page.path ? 'active' : ''}
                >${page.name}
                <shortcut-hint .hotkey=${page.hotkey}></shortcut-hint
              ></a>`,
          )}
        </nav>
        <button
          @click=${() => {
            this.show = !this.show
          }}
        >
          ${this.show ? 'Hide' : 'Show'} shortcuts
        </button>
      </header>
      ${this.show
        ? html`<section>
            <h2>Live registry</h2>
            <table>
              <thead>
                <tr>
                  <th>Group / action</th>
                  <th>Binding</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${[...this.registry.hotkeys, ...this.registry.sequences].map(
                  (reg) =>
                    html`<tr>
                      <td>
                        ${reg.options.meta?.group} / ${reg.options.meta?.name}
                      </td>
                      <td>
                        ${('hotkey' in reg ? [reg.hotkey] : reg.sequence)
                          .map((h) => formatForDisplay(h))
                          .join(' → ')}
                      </td>
                      <td>
                        ${reg.options.enabled === false
                          ? 'Disabled'
                          : `${reg.triggerCount} fired`}
                      </td>
                    </tr>`,
                )}
              </tbody>
            </table>
          </section>`
        : null}
      <main
        @activity=${(e: CustomEvent<string>) => {
          this.activity = [e.detail, ...this.activity].slice(0, 6)
        }}
      >
        ${this.route()}
      </main>
      <section>
        <h2>Key state</h2>
        <p>
          Keys: ${this.keys.value.join(' + ') || 'None'}<br />Codes:
          ${Object.values(this.codes.value).join(' + ') || 'None'}<br />Shift:
          ${this.shift.value ? 'held' : 'released'}
        </p>
        <h2>Activity</h2>
        <button
          @click=${() => {
            this.activity = []
          }}
        >
          Clear log
        </button>
        <ul aria-live="polite">
          ${this.activity.map((message) => html`<li>${message}</li>`)}
        </ul>
      </section>`
  }
}
