import {
  Component,
  DestroyRef,
  Injectable,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core'
import {
  formatForDisplay,
  injectHeldKeyCodes,
  injectHeldKeys,
  injectHotkey,
  injectHotkeyHint,
  injectHotkeyRecorder,
  injectHotkeyRegistrations,
  injectHotkeySequence,
  injectHotkeySequenceRecorder,
  injectHotkeySequences,
  injectHotkeys,
  injectKeyHold,
} from '@tanstack/angular-hotkeys'
import type { ElementRef } from '@angular/core'
import type {
  Hotkey,
  HotkeySequence,
  RecorderKeyMode,
} from '@tanstack/angular-hotkeys'

@Injectable({ providedIn: 'root' })
export class Activity {
  readonly messages = signal<Array<string>>([])
  log(message: string) {
    this.messages.update((items) => [message, ...items].slice(0, 6))
  }
}

@Component({
  selector: 'shortcut-hint',
  standalone: true,
  template: `@if (visible() && enabled()) {
    <kbd>{{ format(hotkey()) }}</kbd>
  }`,
})
export class Hint {
  readonly hotkey = input<Hotkey>('Escape')
  readonly enabled = input(true)
  readonly visible = injectHotkeyHint(() => this.hotkey())
  readonly format = formatForDisplay
}

@Component({
  selector: 'ticket-demo',
  standalone: true,
  imports: [Hint],
  template: ` <section>
    <h2>Tickets</h2>
    <p>Created: {{ count() }}. Buttons and shortcuts share handlers.</p>
    <label
      ><input
        #toggle
        type="checkbox"
        [checked]="enabled()"
        (change)="enabled.set(toggle.checked)"
      />
      Enable ticket actions</label
    >
    <button [disabled]="!enabled()" (click)="create()">
      Create ticket <shortcut-hint hotkey="Alt+[KeyC]" [enabled]="enabled()" />
    </button>
    <button [disabled]="!enabled()" (click)="save()">
      Save pending <shortcut-hint hotkey="Alt+[KeyS]" [enabled]="enabled()" />
    </button>
    <label>Ticket note <input placeholder="Try Alt + C while typing" /></label>
    <p>
      Create uses ignoreInputs: false; Save uses default filtering. Release
      before firing again.
    </p>
  </section>`,
})
export class Tickets {
  readonly activity = inject(Activity)
  readonly count = signal(0)
  readonly enabled = signal(true)
  create = () => {
    this.count.update((n) => n + 1)
    this.activity.log('Ticket created')
  }
  save = () => this.activity.log('Ticket saved')
  constructor() {
    injectHotkey('Alt+[KeyC]', this.create, () => ({
      enabled: this.enabled(),
      ignoreInputs: false,
      meta: { name: 'Create ticket', group: 'Tickets' },
    }))
    injectHotkey('Alt+[KeyS]', this.save, () => ({
      enabled: this.enabled(),
      meta: { name: 'Save ticket', group: 'Tickets' },
    }))
  }
}

@Component({
  selector: 'editor-pane',
  standalone: true,
  template: ` <fieldset #target>
    <legend>{{ name() }} — {{ saves() }} saves</legend>
    <label
      >Editor content<textarea
        #content
        rows="3"
        [value]="text()"
        (input)="text.set(content.value)"
      ></textarea>
    </label>
    <p>
      <kbd>{{ format('Mod+[KeyS]') }}</kbd> Save;
      <kbd>{{ format('Alt+[Backspace]') }}</kbd> Clear
    </p>
  </fieldset>`,
})
export class EditorPane {
  readonly name = input('Editor')
  readonly target = viewChild<ElementRef<HTMLElement>>('target')
  readonly text = signal('One shortcut, two independent editors.')
  readonly saves = signal(0)
  readonly activity = inject(Activity)
  readonly format = formatForDisplay
  constructor() {
    injectHotkeys(
      () => [
        {
          hotkey: 'Mod+[KeyS]',
          callback: () => {
            this.saves.update((n) => n + 1)
            this.activity.log(`${this.name()} saved`)
          },
          options: { meta: { name: `Save ${this.name()}`, group: 'Editor' } },
        },
        {
          hotkey: 'Alt+[Backspace]',
          callback: () => this.text.set(''),
          options: { meta: { name: `Clear ${this.name()}`, group: 'Editor' } },
        },
      ],
      () => ({ target: this.target()?.nativeElement, ignoreInputs: false }),
    )
  }
}

@Component({
  selector: 'editor-demo',
  standalone: true,
  imports: [EditorPane],
  template: ` <section>
    <h2>Editor scopes</h2>
    <p>Focus an editor to choose its Save handler.</p>
    <editor-pane name="Draft" /><editor-pane name="Notes" />
    <label
      ><input
        #repeatToggle
        type="checkbox"
        [checked]="repeat()"
        (change)="repeat.set(repeatToggle.checked)"
      />
      Allow repeat</label
    >
    <p>
      Hold Alt + ArrowRight: {{ count() }}. Release Alt + U for a keyup event.
    </p>
    <fieldset #scope tabindex="0">
      <legend>Propagation</legend>
      <label
        ><input
          #bubbleToggle
          type="checkbox"
          [checked]="bubble()"
          (change)="bubble.set(bubbleToggle.checked)"
        />
        Allow bubbling and browser defaults</label
      >
      <p>Focus here and press Alt + B; watch Activity.</p>
      <button (click)="scope.focus()">Focus this area</button>
    </fieldset>
  </section>`,
})
export class Editor {
  readonly repeat = signal(false)
  readonly count = signal(0)
  readonly bubble = signal(false)
  readonly scope = viewChild<ElementRef<HTMLElement>>('scope')
  readonly activity = inject(Activity)
  constructor() {
    injectHotkey(
      'Alt+[ArrowRight]',
      () => this.count.update((n) => n + 1),
      () => ({
        requireReset: !this.repeat(),
        meta: { name: 'Counter', group: 'Editor' },
      }),
    )
    injectHotkey(
      'Alt+[KeyB]',
      () => this.activity.log('Scoped B'),
      () => ({
        target: this.scope()?.nativeElement,
        stopPropagation: !this.bubble(),
        preventDefault: !this.bubble(),
        meta: { name: 'Scoped propagation', group: 'Editor' },
      }),
    )
    injectHotkey('Alt+[KeyB]', () => this.activity.log('Document B'), {
      meta: { name: 'Document propagation', group: 'Editor' },
    })
    injectHotkey('Alt+[KeyU]', () => this.activity.log('Keyup U'), {
      eventType: 'keyup',
      meta: { name: 'Keyup', group: 'Editor' },
    })
  }
}

@Component({
  selector: 'sequence-demo',
  standalone: true,
  template: ` <section>
    <h2>Sequences</h2>
    <p>
      Physical G then G, G then I, or Shift + R then Shift + T. Repeats do not
      advance steps.
    </p>
    <label
      >Timeout: {{ timeout() }} ms
      <input
        #time
        type="range"
        min="300"
        max="2500"
        step="100"
        [value]="timeout()"
        (input)="timeout.set(+time.value)"
    /></label>
    <table>
      <tbody>
        @for (reg of registry.sequences(); track reg.id) {
          <tr>
            <td>{{ reg.options.meta?.name }}</td>
            <td>{{ label(reg.sequence) }}</td>
            <td>
              {{ reg.matchedStepCount }}/{{ reg.sequence.length }} steps;
              {{ reg.triggerCount }} fired
            </td>
          </tr>
        }
      </tbody>
    </table>
  </section>`,
})
export class Sequences {
  readonly timeout = signal(1000)
  readonly activity = inject(Activity)
  readonly registry = injectHotkeyRegistrations()
  label = (sequence: HotkeySequence) =>
    sequence.map((h) => formatForDisplay(h)).join(' → ')
  constructor() {
    injectHotkeySequence(
      ['[KeyG]', '[KeyG]'],
      () => this.activity.log('Go to top'),
      () => ({
        timeout: this.timeout(),
        meta: { name: 'Go to top', group: 'Sequences' },
      }),
    )
    injectHotkeySequences(
      [
        {
          sequence: ['[KeyG]', '[KeyI]'],
          callback: () => this.activity.log('Inbox'),
          options: { meta: { name: 'Inbox', group: 'Sequences' } },
        },
        {
          sequence: ['Shift+[KeyR]', 'Shift+[KeyT]'],
          callback: () => this.activity.log('Shift chain'),
          options: { meta: { name: 'Shift chain', group: 'Sequences' } },
        },
      ],
      () => ({ timeout: this.timeout() }),
    )
  }
}

@Component({
  selector: 'recording-demo',
  standalone: true,
  template: ` <section>
    <h2>Recording</h2>
    <p>Bindings live in route state. Try Alt + 1 for a conflict.</p>
    <label
      >Record by
      <select
        #modeInput
        [value]="mode()"
        [disabled]="recorder.isRecording() || seq.isRecording()"
        (change)="setMode(modeInput.value)"
      >
        <option value="code">Physical code</option>
        <option value="key">Logical key</option>
      </select></label
    >
    <h3>Single shortcut</h3>
    <p>
      <kbd>{{ format(hotkey()) }}</kbd> — <code>{{ hotkey() }}</code>
    </p>
    <button
      [disabled]="recorder.isRecording() || seq.isRecording()"
      (click)="recorder.startRecording()"
    >
      Record shortcut</button
    ><button (click)="recorder.stopRecording(); hotkey.set(initial)">
      Reset
    </button>
    @if (recorder.isRecording()) {
      <button (click)="recorder.cancelRecording()">Cancel</button>
    }
    <h3>Sequence</h3>
    <p>{{ label(seq.isRecording() ? seq.steps() : sequence()) }}</p>
    <label
      ><input
        #idleInput
        type="checkbox"
        [checked]="idle()"
        (change)="idle.set(idleInput.checked)"
      />
      Commit after 1.5 seconds idle</label
    ><label
      ><input
        #enterInput
        type="checkbox"
        [checked]="enter()"
        (change)="enter.set(enterInput.checked)"
      />
      Enter commits</label
    >
    <button
      [disabled]="recorder.isRecording() || seq.isRecording()"
      (click)="seq.startRecording()"
    >
      Record sequence</button
    ><button
      [disabled]="!seq.isRecording() || !seq.steps().length"
      (click)="seq.commitRecording()"
    >
      Commit
    </button>
    @if (seq.isRecording()) {
      <button (click)="seq.cancelRecording()">Cancel</button>
    }
    <p>
      Backspace removes a step or restores the initial binding when empty.
      Rejected steps remain editable.
    </p>
    <p role="status">{{ problem() }}</p>
  </section>`,
})
export class Recording {
  readonly initial: Hotkey = 'Alt+[KeyR]'
  readonly hotkey = signal<Hotkey>(this.initial)
  readonly sequence = signal<HotkeySequence>(['[KeyX]', '[KeyY]'])
  readonly mode = signal<RecorderKeyMode>('code')
  readonly problem = signal('')
  readonly idle = signal(false)
  readonly enter = signal(true)
  readonly activity = inject(Activity)
  readonly format = formatForDisplay
  label = (sequence: HotkeySequence) =>
    sequence.map((h) => formatForDisplay(h)).join(' → ')
  setMode(value: string) {
    this.mode.set(value === 'key' ? 'key' : 'code')
  }
  readonly recorder = injectHotkeyRecorder(() => ({
    recordBy: this.mode(),
    ignoreInputs: false,
    detectConflicts: {
      exclude: (reg) => reg.options.meta?.name === 'Recorded action',
    },
    validate: (_, { parsedHotkey }) =>
      parsedHotkey.modifiers.length > 0 || 'Include a modifier.',
    onRecord: (value) => {
      this.hotkey.set(value)
      this.problem.set('')
    },
    onClear: () => this.hotkey.set(this.initial),
    onReject: (r) => this.problem.set(r.message),
    onCancel: () => this.problem.set('Cancelled'),
  }))
  readonly seq = injectHotkeySequenceRecorder(() => ({
    recordBy: this.mode(),
    ignoreInputs: false,
    idleTimeoutMs: this.idle() ? 1500 : undefined,
    commitKeys: this.enter() ? 'enter' : 'none',
    detectConflicts: {
      exclude: (reg) => reg.options.meta?.name === 'Recorded sequence',
    },
    validate: (steps) => steps.length >= 2 || 'Record at least two chords.',
    onRecord: (value) => {
      this.sequence.set(value)
      this.problem.set('')
    },
    onClear: () => this.sequence.set(['[KeyX]', '[KeyY]']),
    onReject: (r) => this.problem.set(r.message),
    onCancel: () => this.problem.set('Cancelled'),
  }))
  constructor() {
    injectHotkey(
      this.hotkey,
      () => this.activity.log('Recorded shortcut fired'),
      { meta: { name: 'Recorded action', group: 'Recording' } },
    )
    injectHotkeySequence(
      this.sequence,
      () => this.activity.log('Recorded sequence fired'),
      { meta: { name: 'Recorded sequence', group: 'Recording' } },
    )
  }
}

@Component({
  selector: 'format-demo',
  standalone: true,
  template: ` <section>
    <h2>Formatting</h2>
    <label
      >Platform
      <select
        #platformInput
        [value]="platform()"
        (change)="setPlatform(platformInput.value)"
      >
        <option value="mac">macOS</option>
        <option value="windows">Windows</option>
        <option value="linux">Linux</option>
      </select></label
    >
    <label
      ><input
        #mods
        type="checkbox"
        [checked]="modifiers()"
        (change)="modifiers.set(mods.checked)"
      />
      Modifier symbols</label
    ><label
      ><input
        #keyInput
        type="checkbox"
        [checked]="keys()"
        (change)="keys.set(keyInput.checked)"
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
        @for (binding of bindings; track binding) {
          <tr>
            <td>
              <code>{{ binding }}</code>
            </td>
            <td>{{ format(binding, options()) }}</td>
            <td>
              @for (part of parts(binding); track $index) {
                <kbd>{{ part }}</kbd>
              }
            </td>
          </tr>
        }
      </tbody>
    </table>
    <p>
      Supply layoutMap or keyLabels for layout labels. Formatting never changes
      binding identity.
    </p>
  </section>`,
})
export class Formatting {
  readonly platform = signal<'mac' | 'windows' | 'linux'>('mac')
  readonly modifiers = signal(false)
  readonly keys = signal(true)
  readonly options = computed(() => ({
    platform: this.platform(),
    useSymbols: { modifiers: this.modifiers(), keys: this.keys() },
  }))
  readonly bindings = [
    'Mod+Shift+ArrowUp',
    'Control++',
    'Alt+[KeyS]',
    'Mod+[NumpadAdd]',
  ] as const
  readonly format = formatForDisplay
  parts = (binding: Hotkey) =>
    formatForDisplay(binding, { ...this.options(), parts: true })
  setPlatform(value: string) {
    this.platform.set(value === 'mac' || value === 'linux' ? value : 'windows')
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Hint, Tickets, Editor, Sequences, Recording, Formatting],
  template: ` <header>
      <h1>TanStack Hotkeys kitchen sink</h1>
      <p>
        Hold Alt / Option for hints. Route changes mount and unmount
        registrations.
      </p>
      <nav>
        @for (page of pages; track page.path) {
          <a [href]="'#' + page.path" [class.active]="path() === page.path"
            >{{ page.name }} <shortcut-hint [hotkey]="page.hotkey"
          /></a>
        }
      </nav>
      <button (click)="show.set(!show())">
        {{ show() ? 'Hide' : 'Show' }} shortcuts
      </button>
    </header>
    @if (show()) {
      <section>
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
            @for (reg of registrations(); track reg.id) {
              <tr>
                <td>
                  {{ reg.options.meta?.group }} / {{ reg.options.meta?.name }}
                </td>
                <td>{{ bindingLabel(reg) }}</td>
                <td>
                  {{
                    reg.options.enabled === false
                      ? 'Disabled'
                      : reg.triggerCount + ' fired'
                  }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </section>
    }
    <main>
      @switch (path()) {
        @case ('/editor') {
          <editor-demo />
        }
        @case ('/sequences') {
          <sequence-demo />
        }
        @case ('/recording') {
          <recording-demo />
        }
        @case ('/formatting') {
          <format-demo />
        }
        @default {
          <ticket-demo />
        }
      }
    </main>
    <section>
      <h2>Key state</h2>
      <p>
        Keys: {{ keys().join(' + ') || 'None' }}<br />Codes: {{ codeLabel()
        }}<br />Shift: {{ shift() ? 'held' : 'released' }}
      </p>
      <h2>Activity</h2>
      <button (click)="activity.messages.set([])">Clear log</button>
      <ul aria-live="polite">
        @for (message of activity.messages(); track $index) {
          <li>{{ message }}</li>
        }
      </ul>
    </section>`,
})
export class AppComponent {
  readonly pages = [
    { path: '/', name: 'Tickets', hotkey: 'Alt+[Digit1]' },
    { path: '/editor', name: 'Editor', hotkey: 'Alt+[Digit2]' },
    { path: '/sequences', name: 'Sequences', hotkey: 'Alt+[Digit3]' },
    { path: '/recording', name: 'Recording', hotkey: 'Alt+[Digit4]' },
    { path: '/formatting', name: 'Formatting', hotkey: 'Alt+[Digit5]' },
  ] as const
  readonly path = signal(location.hash.slice(1) || '/')
  readonly show = signal(false)
  readonly activity = inject(Activity)
  readonly keys = injectHeldKeys()
  readonly codes = injectHeldKeyCodes()
  readonly shift = injectKeyHold('Shift')
  readonly codeLabel = computed(
    () => Object.values(this.codes()).join(' + ') || 'None',
  )
  readonly registry = injectHotkeyRegistrations()
  readonly registrations = computed(() => [
    ...this.registry.hotkeys(),
    ...this.registry.sequences(),
  ])
  bindingLabel = (reg: ReturnType<typeof this.registrations>[number]) =>
    ('hotkey' in reg ? [reg.hotkey] : reg.sequence)
      .map((h) => formatForDisplay(h))
      .join(' → ')
  constructor() {
    const update = () => this.path.set(location.hash.slice(1) || '/')
    window.addEventListener('hashchange', update)
    inject(DestroyRef).onDestroy(() =>
      window.removeEventListener('hashchange', update),
    )
    injectHotkeys(
      this.pages.map((page) => ({
        hotkey: page.hotkey,
        callback: () => {
          location.hash = page.path
        },
        options: { meta: { name: page.name, group: 'Navigation' } },
      })),
      { ignoreInputs: true },
    )
    injectHotkey(
      'Alt+Shift+[KeyK]',
      () => this.show.update((value) => !value),
      { meta: { name: 'Show shortcuts', group: 'Navigation' } },
    )
  }
}
