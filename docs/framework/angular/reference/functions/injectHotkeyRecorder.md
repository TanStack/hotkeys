---
id: injectHotkeyRecorder
title: injectHotkeyRecorder
---

# Function: injectHotkeyRecorder()

```ts
function injectHotkeyRecorder(options): AngularHotkeyRecorder;
```

Defined in: [injectHotkeyRecorder.ts:50](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeyRecorder.ts#L50)

Angular inject-based API for recording keyboard shortcuts.

Thin wrapper around the framework-agnostic HotkeyRecorder class: captures
keyboard events, converts them to hotkey strings, and handles Escape to
cancel or Backspace/Delete to clear.

## Parameters

### options

Configuration options for the recorder (or getter)

`HotkeyRecorderOptions` | () => `HotkeyRecorderOptions`

## Returns

[`AngularHotkeyRecorder`](../interfaces/AngularHotkeyRecorder.md)

Object with recording state signals and control functions

## Example

```ts
@Component({ ... })
export class ShortcutSettingsComponent {
  shortcut = signal<Hotkey>('Mod+S')
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
}
```
