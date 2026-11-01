import {
  Component,
  afterNextRender,
  computed,
  input,
  output,
  signal,
} from '@angular/core'
import {
  detectPlatform,
  injectFormatForDisplay,
  injectHotkeys,
  injectHotkeysContext,
} from '@tanstack/angular-hotkeys'
import { commands } from './commands'
import {
  defaultChoices,
  optionGroups,
  platformName,
  toFormatCode,
  toFormatOptions,
} from './format-options'
import type { FormatChoices, OptionGroup } from './format-options'

interface LogEntry {
  id: number
  message: string
}

type Platform = 'mac' | 'windows' | 'linux'

@Component({
  selector: 'header[appHeader]',
  host: { class: 'header' },
  template: `
    <h1>Shortcut cheat sheet</h1>
    <p class="badges">
      @if (serverPlatform(); as platform) {
        <span class="badge">
          Server rendered for: {{ platformName(platform) }}
        </span>
      }
      @if (browserPlatform(); as platform) {
        <span class="badge badge-muted">
          This browser: {{ platformName(platform) }}
        </span>
      }
    </p>
    <p class="lead">
      Labels are rendered on the server with your platform, from the request's
      User-Agent header.
    </p>
  `,
})
export class Header {
  private readonly context = injectHotkeysContext()
  // The platform the server rendered with, from the provider
  readonly serverPlatform = computed(() => this.context.defaultOptions.platform)
  // Read only in the browser after hydration, so it can't cause a mismatch
  readonly browserPlatform = signal<Platform | null>(null)
  readonly platformName = platformName

  constructor() {
    afterNextRender(() => this.browserPlatform.set(detectPlatform()))
  }
}

@Component({
  selector: 'section[appFormatOptions]',
  host: { class: 'panel', 'aria-labelledby': 'format-options-title' },
  template: `
    <h2 id="format-options-title">Format options</h2>
    <div class="option-groups">
      @for (group of optionGroups; track group.id) {
        <fieldset class="option-group">
          <legend>{{ group.label }}</legend>
          <div class="choices">
            @for (choice of group.choices; track choice.value) {
              <label class="choice">
                <input
                  type="radio"
                  [name]="group.id"
                  [value]="choice.value"
                  [checked]="choices()[group.id] === choice.value"
                  (change)="select(group, choice.value)"
                />
                <span>{{ choice.label }}</span>
              </label>
            }
          </div>
        </fieldset>
      }
    </div>
    <pre class="code"><code>{{ code() }}</code></pre>
  `,
})
export class FormatOptions {
  readonly choices = input.required<FormatChoices>()
  readonly choicesChange = output<FormatChoices>()
  readonly optionGroups = optionGroups
  readonly code = computed(() => toFormatCode(this.choices()))

  select(group: OptionGroup, value: string) {
    this.choicesChange.emit({ ...this.choices(), [group.id]: value })
  }
}

/**
 * Renders a label as one keycap, or with `parts: true` as one keycap per key.
 * A sequence's parts are one array per step.
 */
@Component({
  selector: 'td[appHotkeyLabel]',
  template: `
    @if (text(); as text) {
      <kbd>{{ text }}</kbd>
    } @else {
      @for (step of steps(); track $index) {
        <span class="step">
          @if ($index > 0) {
            <span class="sequence-separator">{{ sequenceSeparator() }}</span>
          }
          @for (part of step; track $index) {
            <kbd>{{ part }}</kbd>
          }
        </span>
      }
    }
  `,
})
export class HotkeyLabel {
  readonly label = input.required<
    string | Array<string> | Array<Array<string>>
  >()
  readonly sequenceSeparator = input.required<string>()

  readonly text = computed(() => {
    const label = this.label()
    return typeof label === 'string' ? label : null
  })
  readonly steps = computed(() => {
    const label = this.label()
    if (typeof label === 'string') return []
    return isStepList(label) ? label : [label]
  })
}

function isStepList(
  label: Array<string> | Array<Array<string>>,
): label is Array<Array<string>> {
  return Array.isArray(label[0])
}

@Component({
  selector: 'section[appCheatSheet]',
  host: { class: 'panel', 'aria-labelledby': 'cheat-sheet-title' },
  imports: [HotkeyLabel],
  template: `
    <h2 id="cheat-sheet-title">Shortcuts</h2>
    <table class="cheat-sheet">
      <tbody>
        @for (command of commands; track command.id) {
          <tr [attr.data-command]="command.id">
            <th scope="row">{{ command.name }}</th>
            <td
              appHotkeyLabel
              class="label"
              [label]="format(command.hotkey, options())"
              [sequenceSeparator]="options().sequenceSeparator ?? ' '"
            ></td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class CheatSheet {
  readonly choices = input.required<FormatChoices>()
  // Formats with the provider's platform, so the server renders the user's labels
  readonly format = injectFormatForDisplay()
  readonly options = computed(() => toFormatOptions(this.choices()))
  readonly commands = commands
}

@Component({
  selector: 'section[appActivityLog]',
  host: { class: 'panel', 'aria-labelledby': 'activity-log-title' },
  template: `
    <h2 id="activity-log-title">Activity log</h2>
    @if (entries().length === 0) {
      <p class="empty">Press a shortcut</p>
    } @else {
      <ol class="log">
        @for (entry of entries(); track entry.id) {
          <li>{{ entry.message }}</li>
        }
      </ol>
    }
  `,
})
export class ActivityLog {
  readonly entries = input.required<Array<LogEntry>>()
}

@Component({
  selector: 'app-cheat-sheet-page',
  imports: [Header, FormatOptions, CheatSheet, ActivityLog],
  template: `
    <main class="page">
      <header appHeader></header>
      <section appFormatOptions [(choices)]="choices"></section>
      <section appCheatSheet [choices]="choices()"></section>
      <section appActivityLog [entries]="log()"></section>
    </main>
  `,
})
export class CheatSheetPage {
  readonly choices = signal<FormatChoices>(defaultChoices)
  readonly log = signal<Array<LogEntry>>([])
  private nextLogId = 0

  constructor() {
    injectHotkeys(
      commands.map((command) => ({
        hotkey: command.hotkey,
        callback: () => {
          const entry = { id: this.nextLogId++, message: command.message }
          this.log.update((entries) => [entry, ...entries].slice(0, 5))
        },
        options: { meta: { name: command.name } },
      })),
    )
  }
}
