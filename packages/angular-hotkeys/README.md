# @tanstack/angular-hotkeys

> Angular adapter for [TanStack Hotkeys](https://tanstack.com/hotkeys) - keyboard shortcuts made easy

[![npm version](https://img.shields.io/npm/v/@tanstack/angular-hotkeys.svg)](https://www.npmjs.com/package/@tanstack/angular-hotkeys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✅ **Type-safe hotkey bindings** - Template strings (`Mod+Shift+S`, `Escape`) or parsed objects  
✅ **Cross-platform** - `Mod` key automatically maps to Cmd on macOS, Ctrl on Windows/Linux  
✅ **Sequence support** - Vim-style multi-key sequences (`g g`, `d d`)  
✅ **Key state tracking** - Track which keys are currently held down  
✅ **Hotkey recording** - Built-in UI helpers for letting users define their own shortcuts  
✅ **Angular signals** - Inject-based APIs that work with Angular 19+

## Installation

```bash
npm install @tanstack/angular-hotkeys @tanstack/hotkeys
# or
bun add @tanstack/angular-hotkeys @tanstack/hotkeys
# or
pnpm add @tanstack/angular-hotkeys @tanstack/hotkeys
```

## Quick Start

**1. Provide the hotkeys context in your app config:**

```ts
// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHotkeys(),
  ],
}
```

**2. Register a hotkey in a component (injection context):**

```ts
import { Component } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<p>Press Cmd/Ctrl+S to save</p>`,
})
export class AppComponent {
  constructor() {
    injectHotkey('Mod+S', (event) => {
      event.preventDefault()
      console.log('Save!')
    })
  }
}
```

## Usage

### Basic Hotkey

```ts
import { Component, signal } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-save-button',
  standalone: true,
  template: `<button>Save (Cmd/Ctrl+S)</button>`,
})
export class SaveButtonComponent {
  private readonly saveCount = signal(0)

  constructor() {
    injectHotkey('Mod+S', (event, { hotkey }) => {
      event.preventDefault()
      this.saveCount.update((c) => c + 1)
    })
  }
}
```

### Conditional Hotkeys

```ts
import { Component, signal } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="modal">Press Escape to close</div>
    }
  `,
})
export class ModalComponent {
  isOpen = signal(true)

  constructor() {
    injectHotkey(
      'Escape',
      () => this.close(),
      () => ({ enabled: this.isOpen() }),
    )
  }

  close() {
    this.isOpen.set(false)
  }
}
```

### Scoped Hotkeys

Use a getter for `target` so the hotkey waits for the element (e.g. from `viewChild`):

```ts
import { Component, viewChild, ElementRef } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-editor',
  standalone: true,
  template: `<div #editorRef contenteditable></div>`,
})
export class EditorComponent {
  private readonly editorRef =
    viewChild<ElementRef<HTMLDivElement>>('editorRef')

  constructor() {
    injectHotkey(
      'Mod+B',
      () => this.toggleBold(),
      () => ({ target: this.editorRef()?.nativeElement ?? null }),
    )
  }

  toggleBold() {
    document.execCommand('bold')
  }
}
```

### Hotkey Sequences (Vim-style)

```ts
import { Component, signal } from '@angular/core'
import { injectHotkeySequence, injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-vim-editor',
  standalone: true,
  template: `<div>Try Vim shortcuts! Last: {{ lastSequence() }}</div>`,
})
export class VimEditorComponent {
  lastSequence = signal<string | null>(null)

  constructor() {
    injectHotkeySequence(['G', 'G'], () =>
      this.lastSequence.set('gg → Go to top'),
    )
    injectHotkeySequence(['D', 'D'], () =>
      this.lastSequence.set('dd → Delete line'),
    )
    injectHotkeySequence(
      ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'],
      () => this.lastSequence.set('Konami!'),
      { timeout: 1500 },
    )
    injectHotkey('Escape', () => this.lastSequence.set(null))
  }
}
```

### Track Held Keys

```ts
import { Component } from '@angular/core'
import { injectHeldKeys, injectKeyHold } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-key-tracker',
  standalone: true,
  template: `
    <div>Shift: {{ isShiftHeld() ? 'Pressed' : 'Not pressed' }}</div>
    <div>
      All held:
      @for (key of heldKeys(); track key) {
        <kbd>{{ key }}</kbd>
      }
    </div>
  `,
})
export class KeyTrackerComponent {
  heldKeys = injectHeldKeys()
  isShiftHeld = injectKeyHold('Shift')
}
```

### Hotkey Recorder

```ts
import { Component, signal } from '@angular/core'
import { injectHotkey, injectHotkeyRecorder } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-shortcut-settings',
  standalone: true,
  template: `
    <div>Current shortcut: {{ shortcut() }}</div>
    <button (click)="recorder.startRecording()">
      {{ recorder.isRecording() ? 'Recording...' : 'Edit Shortcut' }}
    </button>
  `,
})
export class ShortcutSettingsComponent {
  shortcut = signal('Mod+S')
  recorder = injectHotkeyRecorder({
    onRecord: (hotkey) => this.shortcut.set(hotkey),
    onCancel: () => console.log('Recording cancelled'),
  })

  constructor() {
    injectHotkey(
      () => this.shortcut(),
      () => this.handleSave(),
      () => ({ enabled: !this.recorder.isRecording() }),
    )
  }

  handleSave() {
    // save logic
  }
}
```

### Global Configuration

```ts
// app.config.ts
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHotkeys({
      hotkey: {
        preventDefault: true,
        enabled: true,
      },
      hotkeySequence: {
        timeout: 1000,
      },
    }),
  ],
}
```

## API

### `injectHotkey(hotkey, callback, options?)`

Register a keyboard hotkey. Call in an injection context (e.g. constructor or field initializer).

- **hotkey**: String like `'Mod+S'` or `'Escape'`, or getter function
- **callback**: Function called when hotkey is pressed
- **options**: Optional configuration (or getter for reactive options)

**Options:** `enabled`, `preventDefault`, `stopPropagation`, `target`, `platform`, `requireReset`

### `injectHotkeySequence(sequence, callback, options?)`

Register a multi-key sequence (Vim-style).

- **sequence**: Array of hotkey strings like `['G', 'G']`, or getter function
- **callback**: Function called when sequence completes
- **options**: Optional configuration (or getter function)

**Options:** `enabled`, `timeout` (ms), `platform`

### `injectHeldKeys()`

Returns a signal of currently held key names.

```ts
const heldKeys = injectHeldKeys()
// heldKeys() => ['Shift', 'A']
```

### `injectHeldKeyCodes()`

Returns a signal of a map from held key names to their physical `event.code` values.

```ts
const heldCodes = injectHeldKeyCodes()
// heldCodes() => { Shift: 'ShiftLeft', A: 'KeyA' }
```

### `injectKeyHold(key)`

Returns a signal that is true when the given key is held.

```ts
const isShiftHeld = injectKeyHold('Shift')
// isShiftHeld() => true | false
```

### `injectHotkeyRecorder(options)`

Hotkey recording interface.

**Options:** `onRecord`, `onCancel`, `onClear`

**Returns:** `isRecording`, `recordedHotkey`, `startRecording`, `stopRecording`, `cancelRecording`

### `provideHotkeys(defaultOptions?)`

Provider for global hotkey defaults. Use in `ApplicationConfig` providers.

### `injectHotkeysContext()` / `injectDefaultHotkeysOptions()`

Inject the hotkeys context or merged default options (for advanced use).

## Cross-Platform Keys

Use `Mod` for cross-platform modifier:

- `Mod+S` → `Cmd+S` on macOS, `Ctrl+S` on Windows/Linux
- `Mod+Shift+P` → `Cmd+Shift+P` on macOS, `Ctrl+Shift+P` elsewhere

## Related

- [TanStack Hotkeys](https://tanstack.com/hotkeys) - The core library
- [@tanstack/react-hotkeys](https://tanstack.com/hotkeys) - React adapter
- [@tanstack/solid-hotkeys](https://tanstack.com/hotkeys) - Solid adapter

## License

MIT
