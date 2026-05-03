---
title: Hotkey Recording Guide
id: hotkey-recording
---

TanStack Hotkeys provides the `HotkeyRecorder` class for building shortcut customization UIs. The class is re-exported from `@tanstack/ember-hotkeys` and can be used directly in Ember components.

## Basic Usage

```gts
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { registerDestructor } from '@ember/destroyable';
import { HotkeyRecorder, formatForDisplay } from '@tanstack/ember-hotkeys';
import type { Hotkey } from '@tanstack/ember-hotkeys';

export default class ShortcutRecorder extends Component {
  @tracked recordedHotkey: Hotkey | null = null;
  @tracked isRecording = false;

  recorder = new HotkeyRecorder({
    onRecord: (hotkey) => {
      this.recordedHotkey = hotkey;
      this.isRecording = false;
    },
    onCancel: () => {
      this.isRecording = false;
    },
  });

  constructor(owner: unknown, args: Record<string, unknown>) {
    super(owner, args);
    registerDestructor(this, () => this.recorder.cancel());
  }

  @action startRecording() {
    this.recorder.start();
    this.isRecording = true;
  }

  @action cancelRecording() {
    this.recorder.cancel();
  }

  <template>
    <button type="button" {{on "click" this.startRecording}}>
      {{#if this.isRecording}}
        Press a key combination...
      {{else if this.recordedHotkey}}
        {{formatForDisplay this.recordedHotkey}}
      {{else}}
        Click to record
      {{/if}}
    </button>
    {{#if this.isRecording}}
      <button type="button" {{on "click" this.cancelRecording}}>Cancel</button>
    {{/if}}
  </template>
}
```

## `ignoreInputs`

The `HotkeyRecorder` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements — keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input.

```ts
const recorder = new HotkeyRecorder({
  ignoreInputs: false, // record even from inside inputs
  onRecord: (hotkey) => console.log(hotkey),
});
```
