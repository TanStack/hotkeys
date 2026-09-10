---
id: HotkeySequenceRecorderController
title: HotkeySequenceRecorderController
---

# Class: HotkeySequenceRecorderController

Defined in: [controllers/hotkey-sequence-recorder.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L45)

A Lit ReactiveController that records multi-chord sequences (Vim-style shortcuts).

Wraps the framework-agnostic `HotkeySequenceRecorder` class, managing store
subscriptions and host update lifecycle automatically.

## Example

```ts
class ShortcutSettings extends LitElement {
  private recorder = new HotkeySequenceRecorderController(this, {
    onRecord: (sequence) => {
      this.sequence = sequence
      this.requestUpdate()
    },
    onCancel: () => {
      console.log('Recording cancelled')
    },
  })

  private sequence: HotkeySequence | null = null

  render() {
    return html`
      <button @click=${() => this.recorder.startRecording()}>
        ${this.recorder.isRecording ? 'Recording...' : 'Edit Sequence'}
      </button>
      ${this.recorder.steps.length
        ? html`<div>Steps: ${this.recorder.steps.join(' → ')}</div>`
        : nothing}
      ${this.recorder.recordedSequence
        ? html`<div>Recorded: ${this.recorder.recordedSequence.join(' → ')}</div>`
        : nothing}
    `
  }
}
```

## Implements

- `ReactiveController`

## Constructors

### Constructor

```ts
new HotkeySequenceRecorderController(_host, _options): HotkeySequenceRecorderController;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:76](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L76)

#### Parameters

##### \_host

`ReactiveControllerHost`

The Lit component that owns this controller.

##### \_options

`HotkeySequenceRecorderOptions`

Configuration options for the sequence recorder.

#### Returns

`HotkeySequenceRecorderController`

## Accessors

### isRecording

#### Get Signature

```ts
get isRecording(): boolean;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:58](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L58)

Whether recording is currently active.

##### Returns

`boolean`

***

### recordedSequence

#### Get Signature

```ts
get recordedSequence(): HotkeySequence | null;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:68](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L68)

Last committed sequence, or null if none.

##### Returns

`HotkeySequence` \| `null`

***

### steps

#### Get Signature

```ts
get steps(): HotkeySequence;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:63](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L63)

Chords captured in the current session.

##### Returns

`HotkeySequence`

## Methods

### cancelRecording()

```ts
cancelRecording(): void;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:133](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L133)

Cancel recording without saving.

#### Returns

`void`

***

### commitRecording()

```ts
commitRecording(): void;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:138](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L138)

Commit current steps as a sequence (no-op if empty).

#### Returns

`void`

***

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:85](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L85)

Subscribes to the recorder store and updates internal state when changes occur.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostConnected
```

***

### hostDisconnected()

```ts
hostDisconnected(): void;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:107](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L107)

Unsubscribes from the recorder store and destroys the recorder instance to prevent memory leaks.

#### Returns

`void`

#### Implementation of

```ts
ReactiveController.hostDisconnected
```

***

### setOptions()

```ts
setOptions(options): void;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:117](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L117)

Updates the recorder options.

#### Parameters

##### options

`Partial`\<`HotkeySequenceRecorderOptions`\>

#### Returns

`void`

***

### startRecording()

```ts
startRecording(): void;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:123](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L123)

Start recording a new sequence.

#### Returns

`void`

***

### stopRecording()

```ts
stopRecording(): void;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:128](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L128)

Stop recording (same as cancel but without calling onCancel).

#### Returns

`void`
