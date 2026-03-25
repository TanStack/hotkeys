---
id: injectHotkey
title: injectHotkey
---

# Function: injectHotkey()

```ts
function injectHotkey(
   hotkey, 
   callback, 
   options): void;
```

Defined in: [injectHotkey.ts:86](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkey.ts#L86)

Angular inject-based API for registering a keyboard hotkey.

Uses the singleton HotkeyManager for efficient event handling.
The callback receives both the keyboard event and a context object
containing the hotkey string and parsed hotkey.

Call in an injection context (e.g. constructor or field initializer).
Uses effect() to track reactive dependencies and update registration
when options or the callback change.
`enabled: false` keeps the registration (visible in devtools) and only suppresses firing; the same
handle is updated instead of unregistering and re-registering when identity is unchanged.

## Parameters

### hotkey

The hotkey string (e.g. 'Mod+S', 'Escape') or getter function

`RegisterableHotkey` | () => `RegisterableHotkey`

### callback

`HotkeyCallback`

The function to call when the hotkey is pressed

### options

Options for the hotkey behavior, or getter for reactive options

[`InjectHotkeyOptions`](../interfaces/InjectHotkeyOptions.md) | () => [`InjectHotkeyOptions`](../interfaces/InjectHotkeyOptions.md)

## Returns

`void`

## Examples

```ts
@Component({ ... })
export class SaveButtonComponent {
  private readonly saveCount = signal(0)

  constructor() {
    injectHotkey('Mod+S', (event, { hotkey }) => {
      event.preventDefault()
      this.saveCount.update(c => c + 1)
    })
  }
}
```

```ts
@Component({ ... })
export class ModalComponent {
  isOpen = signal(true)

  constructor() {
    injectHotkey('Escape', () => this.close(), () => ({ enabled: this.isOpen() }))
  }
}
```

```ts
@Component({ ... })
export class EditorComponent {
  private readonly editorRef = viewChild<ElementRef<HTMLDivElement>>('editorRef')

  constructor() {
    injectHotkey('Mod+B', () => this.toggleBold(), () => ({
      target: this.editorRef()?.nativeElement ?? null,
    }))
  }
}
```
