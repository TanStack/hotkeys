import {
  Component,
  ElementRef,
  Injectable,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core'
import {
  formatForDisplay,
  injectHotkey,
  provideHotkeys,
} from '@tanstack/angular-hotkeys'
import type { OnDestroy, OnInit } from '@angular/core'
import type { Hotkey } from '@tanstack/angular-hotkeys'

// Every hotkey below is a plain `injectHotkey` call with no `scope` option. It
// registers in the scope of the nearest `provideHotkeys` that sets one.

type ExclusiveOption = boolean | { allow: ReadonlyArray<string> }

interface Entry {
  id: number
  scope: string
  message: string
}

@Injectable({ providedIn: 'root' })
export class Activity {
  readonly entries = signal<Array<Entry>>([])
  #nextId = 0

  log(scope: string, message: string) {
    this.entries.update((entries) =>
      [{ id: this.#nextId++, scope, message }, ...entries].slice(0, 20),
    )
  }

  clear() {
    this.entries.set([])
  }
}

@Component({
  selector: 'app-key',
  standalone: true,
  template: `<kbd>{{ label() }}</kbd>`,
})
export class Key {
  readonly hotkey = input.required<Hotkey>()
  readonly label = computed(() => formatForDisplay(this.hotkey()))
}

// ---------------------------------------------------------------------------
// Providers drawn as boxes
// ---------------------------------------------------------------------------

/** The box alone, for content rendered apart from its provider, such as a dialog. */
@Component({
  selector: 'app-scope-frame',
  standalone: true,
  template: `
    <fieldset
      class="scope-frame"
      [attr.data-exclusive]="!!exclusive()"
      [attr.data-enabled]="enabled() !== false"
    >
      <legend>
        <code>{{ label() }}</code>
      </legend>
      <ng-content />
    </fieldset>
  `,
})
export class ScopeFrame {
  readonly scope = input<string>('global')
  readonly exclusive = input<ExclusiveOption | undefined>(undefined)
  readonly enabled = input<boolean | undefined>(undefined)
  readonly label = computed(() => {
    const scope = this.scope()
    const exclusive = this.exclusive()
    const enabled = this.enabled()
    const attributes = [
      scope !== 'global' && `scope: '${scope}'`,
      exclusive &&
        `exclusive: ${exclusive === true ? 'true' : `{ allow: [${exclusive.allow.map((s) => `'${s}'`).join(', ')}] }`}`,
      enabled !== undefined && `enabled: ${enabled}`,
    ].filter(Boolean)
    // The root has no scoped provider; its hotkeys are in the `global` scope.
    return attributes.length > 0
      ? `provideHotkeys({ ${attributes.join(', ')} })`
      : 'Root injector'
  })
}

/**
 * Provides a hotkey scope to the content inside it, with a box around it. The
 * provider's getters run in this component's injection context, so they can
 * read its inputs.
 */
@Component({
  selector: 'app-scope',
  standalone: true,
  imports: [ScopeFrame],
  providers: [
    provideHotkeys({
      scope: () => inject(Scope).scope(),
      exclusive: () => inject(Scope).exclusive(),
      enabled: () => inject(Scope).enabled(),
    }),
  ],
  template: `
    <app-scope-frame
      [scope]="scope()"
      [exclusive]="exclusive()"
      [enabled]="enabled()"
    >
      <ng-content />
    </app-scope-frame>
  `,
})
export class Scope {
  readonly scope = input.required<string>()
  readonly exclusive = input<ExclusiveOption | undefined>(undefined)
  readonly enabled = input<boolean | undefined>(undefined)
}

// ---------------------------------------------------------------------------
// A hotkey in its own scope, so a dialog can allow just this one
// ---------------------------------------------------------------------------

@Component({
  selector: 'app-palette',
  standalone: true,
  imports: [Key],
  template: `
    <section class="demo-section">
      <h2>Command palette</h2>
      <p>
        <app-key hotkey="Mod+K" /> lives in its own <code>palette</code> scope,
        so an exclusive dialog can allow it without allowing everything else.
      </p>
      <div class="counter">
        Opened {{ opened() }} {{ opened() === 1 ? 'time' : 'times' }}
      </div>
    </section>
  `,
})
export class Palette {
  readonly opened = signal(0)

  constructor() {
    const activity = inject(Activity)
    injectHotkey('Mod+K', () => {
      this.opened.update((n) => n + 1)
      activity.log('palette', 'Command palette opened')
    })
  }
}

// ---------------------------------------------------------------------------
// Nested scopes beat their ancestors
// ---------------------------------------------------------------------------

@Component({
  selector: 'app-comment-box',
  standalone: true,
  template: `
    <div class="panel">
      <strong>Comments</strong>
      <p>{{ comments() }} posted</p>
    </div>
  `,
})
export class CommentBox {
  readonly comments = signal(0)

  constructor() {
    const activity = inject(Activity)
    injectHotkey('Mod+S', () => {
      this.comments.update((n) => n + 1)
      activity.log('comments', 'Comment posted')
    })
  }
}

@Component({
  selector: 'app-nested-demo',
  standalone: true,
  imports: [CommentBox, Key, Scope],
  template: `
    <section class="demo-section">
      <h2>Nested scopes</h2>
      <p>
        The document and its comment box both register
        <app-key hotkey="Mod+S" />. The comment box is nested, so it wins while
        it is mounted. Hide it and the document handles the key again.
      </p>
      <label>
        <input
          type="checkbox"
          [checked]="showComments()"
          (change)="showComments.set($any($event.target).checked)"
        />
        Show comment box
      </label>
      @if (showComments()) {
        <app-scope scope="comments"><app-comment-box /></app-scope>
      }
    </section>
  `,
})
export class NestedDemo {
  readonly showComments = signal(true)

  constructor() {
    const activity = inject(Activity)
    injectHotkey('Mod+S', () => activity.log('document', 'Document saved'))
  }
}

// ---------------------------------------------------------------------------
// enabled turns a scope off without destroying it
// ---------------------------------------------------------------------------

@Component({
  selector: 'app-folder-pane',
  standalone: true,
  template: `
    <button
      class="panel folder"
      [attr.data-current]="current()"
      (click)="selected.emit()"
    >
      <strong>{{ name() }}</strong>
      <span>{{ items() }} items</span>
    </button>
  `,
})
export class FolderPane {
  readonly name = input.required<string>()
  readonly current = input(false)
  readonly selected = output()
  readonly items = signal(0)

  constructor() {
    const activity = inject(Activity)
    injectHotkey('Alt+[KeyN]', () => {
      this.items.update((n) => n + 1)
      activity.log(this.name().toLowerCase(), `Added to ${this.name()}`)
    })
  }
}

@Component({
  selector: 'app-tabs-demo',
  standalone: true,
  imports: [FolderPane, Key, Scope],
  template: `
    <section class="demo-section">
      <h2>Enabled scopes</h2>
      <p>
        All three folders stay in the page and register
        <app-key hotkey="Alt+N" />. Only the selected folder's provider is
        <code>enabled</code>, so the key adds to that one. Switch with
        <app-key hotkey="Alt+1" />, <app-key hotkey="Alt+2" />, and
        <app-key hotkey="Alt+3" />.
      </p>
      <div class="folders">
        @for (name of folders; track name) {
          <app-scope
            [scope]="name.toLowerCase()"
            [enabled]="current() === name"
          >
            <app-folder-pane
              [name]="name"
              [current]="current() === name"
              (selected)="current.set(name)"
            />
          </app-scope>
        }
      </div>
    </section>
  `,
})
export class TabsDemo {
  readonly folders = ['Inbox', 'Archive', 'Spam'] as const
  readonly current = signal<(typeof this.folders)[number]>('Inbox')

  constructor() {
    injectHotkey('Alt+[Digit1]', () => this.current.set('Inbox'))
    injectHotkey('Alt+[Digit2]', () => this.current.set('Archive'))
    injectHotkey('Alt+[Digit3]', () => this.current.set('Spam'))
  }
}

// ---------------------------------------------------------------------------
// exclusive suspends every other scope, except the ones it allows
// ---------------------------------------------------------------------------

/** Nested in the exclusive scope, so it stays active without being allowed. */
@Component({
  selector: 'app-steps',
  standalone: true,
  imports: [Key],
  template: `
    <div class="panel">
      Step {{ step() }} of 3. <app-key hotkey="Alt+N" /> moves to the next step.
      It is in the nested <code>dialog-steps</code> scope, so it still works,
      and it takes the key from the suspended folders.
    </div>
  `,
})
export class Steps {
  readonly step = signal(1)

  constructor() {
    const activity = inject(Activity)
    injectHotkey('Alt+[KeyN]', () => {
      this.step.update((n) => (n % 3) + 1)
      activity.log('dialog-steps', 'Next step')
    })
  }
}

/**
 * The dialog provides its own exclusive scope. Its element moves to the body,
 * outside the boxes above; the scope still comes from the injector tree, not
 * from where it renders.
 */
@Component({
  selector: 'app-exclusive-dialog',
  standalone: true,
  imports: [Key, Scope, ScopeFrame, Steps],
  providers: [
    provideHotkeys({
      scope: 'dialog',
      exclusive: () => inject(ExclusiveDialog).exclusive(),
    }),
  ],
  template: `
    <div class="backdrop" (click)="closed.emit()">
      <div
        class="dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Exclusive dialog"
        (click)="$event.stopPropagation()"
      >
        <app-scope-frame scope="dialog" [exclusive]="exclusive()">
          <h2>Exclusive dialog</h2>
          <p>
            <app-key hotkey="Mod+S" /> saves this dialog instead of the
            document. <app-key hotkey="Escape" /> closes it. The folder hotkeys
            are suspended, and so is anything you did not allow above.
          </p>
          <app-scope scope="dialog-steps"><app-steps /></app-scope>
          <div class="actions">
            <button class="secondary" (click)="closed.emit()">Cancel</button>
            <button (click)="saved.emit()">Save</button>
          </div>
        </app-scope-frame>
      </div>
    </div>
  `,
})
export class ExclusiveDialog implements OnInit, OnDestroy {
  readonly exclusive = input.required<ExclusiveOption>()
  readonly closed = output()
  readonly saved = output()
  readonly #element = inject(ElementRef<HTMLElement>)

  constructor() {
    injectHotkey('Escape', () => this.closed.emit())
    injectHotkey('Mod+S', () => this.saved.emit())
  }

  ngOnInit() {
    document.body.append(this.#element.nativeElement)
  }

  ngOnDestroy() {
    this.#element.nativeElement.remove()
  }
}

@Component({
  selector: 'app-dialog-demo',
  standalone: true,
  imports: [ExclusiveDialog, Key],
  template: `
    <section class="demo-section">
      <h2>Exclusive scopes</h2>
      <p>
        An exclusive provider suspends every other scope while it exists,
        including <code>global</code>. Scopes nested inside it keep working.
        List scopes in <code>allow</code> to keep them working too.
      </p>
      <fieldset>
        <legend>Allow while the dialog is open</legend>
        @for (scope of allowOptions; track scope) {
          <label>
            <input
              type="checkbox"
              [checked]="allow().includes(scope)"
              (change)="toggle(scope, $any($event.target).checked)"
            />
            <code>{{ scope }}</code>
          </label>
        }
      </fieldset>
      <button (click)="open.set(true)">
        Open dialog <app-key hotkey="Alt+D" />
      </button>
      @if (open()) {
        <app-exclusive-dialog
          [exclusive]="exclusive()"
          (closed)="open.set(false)"
          (saved)="save()"
        />
      }
    </section>
  `,
})
export class DialogDemo {
  readonly allowOptions = ['global', 'palette'] as const
  readonly open = signal(false)
  readonly allow = signal<Array<string>>(['palette'])
  readonly exclusive = computed<ExclusiveOption>(() =>
    this.allow().length > 0 ? { allow: this.allow() } : true,
  )
  readonly #activity = inject(Activity)

  constructor() {
    injectHotkey('Alt+[KeyD]', () => this.open.set(true))
  }

  toggle(scope: string, checked: boolean) {
    this.allow.update((allow) =>
      checked ? [...allow, scope] : allow.filter((s) => s !== scope),
    )
  }

  save() {
    this.#activity.log('dialog', 'Dialog saved')
    this.open.set(false)
  }
}

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

/** Registered with no scoped provider above it, so it is in the `global` scope. */
@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [Key],
  template: `
    <section class="demo-section">
      <h2>Activity</h2>
      <p>
        <app-key hotkey="Alt+L" /> clears the log. No scoped provider is above
        it, so it is in the <code>global</code> scope.
      </p>
      <div class="log">
        @for (entry of activity.entries(); track entry.id) {
          <div class="log-entry">
            <code class="log-scope">{{ entry.scope }}</code>
            {{ entry.message }}
          </div>
        } @empty {
          <div class="hint">Press a hotkey above.</div>
        }
      </div>
    </section>
  `,
})
export class ActivityLog {
  readonly activity = inject(Activity)

  constructor() {
    injectHotkey('Alt+[KeyL]', () => this.activity.clear())
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ActivityLog,
    DialogDemo,
    NestedDemo,
    Palette,
    Scope,
    ScopeFrame,
    TabsDemo,
  ],
  template: `
    <div class="app">
      <header>
        <h1>Hotkey scopes</h1>
        <p>
          Each <code>provideHotkeys</code> with a <code>scope</code> in a
          component's <code>providers</code> is a scope. Its hotkeys fire while
          the component exists and is enabled. Open the hotkeys devtools to see
          which scopes are active, suspended, or allowed.
        </p>
      </header>
      <app-scope-frame>
        <app-scope scope="palette"><app-palette /></app-scope>
        <app-scope scope="document"><app-nested-demo /></app-scope>
        <app-scope scope="mail"><app-tabs-demo /></app-scope>
        <app-scope scope="settings"><app-dialog-demo /></app-scope>
        <app-activity-log />
      </app-scope-frame>
    </div>
  `,
})
export class AppComponent {}
