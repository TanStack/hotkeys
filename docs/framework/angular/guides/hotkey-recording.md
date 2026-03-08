---
title: Hotkey Recording Guide
id: hotkey-recording
---

TanStack Hotkeys provides the `injectHotkeyRecorder` API for building shortcut customization UIs in Angular.

## Basic Usage

```ts
import { Component } from '@angular/core'
import {
  formatForDisplay,
  injectHotkeyRecorder,
} from '@tanstack/angular-hotkeys'

@Component({
  standalone: true,
  template: `
    <button (click)="recorder.isRecording() ? recorder.stopRecording() : recorder.startRecording()">
      {{
        recorder.isRecording()
          ? 'Press a key combination...'
          : recorder.recordedHotkey()
            ? formatForDisplay(recorder.recordedHotkey()!)
            : 'Click to record'
      }}
    </button>
    @if (recorder.isRecording()) {
      <button (click)="recorder.cancelRecording()">Cancel</button>
    }
  `,
})
export class ShortcutRecorderComponent {
  readonly formatForDisplay = formatForDisplay
  readonly recorder = injectHotkeyRecorder({
    onRecord: (hotkey) => {
      console.log('Recorded:', hotkey)
    },
  })
}
```

## Return Value

- `isRecording()`: Angular signal getter indicating whether recording is active
- `recordedHotkey()`: Angular signal getter with the most recently recorded hotkey
- `startRecording()`: start listening for key presses
- `stopRecording()`: stop listening and keep the current recording
- `cancelRecording()`: stop listening and discard the in-progress recording

## Options

```ts
injectHotkeyRecorder({
  onRecord: (hotkey) => {},
  onCancel: () => {},
  onClear: () => {},
})
```

## Global Default Options via Provider

```ts
import { ApplicationConfig } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHotkeys({
      hotkeyRecorder: {
        onCancel: () => console.log('Recording cancelled'),
      },
    }),
  ],
}
```

## Recording Behavior

- Modifier-only presses do not complete a recording.
- Modifier plus key combinations record the full shortcut.
- Escape cancels recording.
- Backspace and Delete clear the shortcut.
- Recorded values are normalized to portable `Mod` format.
