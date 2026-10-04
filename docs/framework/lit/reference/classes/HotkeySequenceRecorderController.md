---
id: HotkeySequenceRecorderController
title: HotkeySequenceRecorderController
---

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

Defined in: [controllers/hotkey-sequence-recorder.ts:77](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L77)

#### Parameters

##### \_host

`ReactiveControllerHost`

The Lit component that owns this controller.

##### \_options

`HotkeySequenceRecorderOptions` \| (() => `HotkeySequenceRecorderOptions`)

Options or a getter, read during recording.

#### Returns

`HotkeySequenceRecorderController`

## Accessors

### isRecording

#### Get Signature

```ts
get isRecording(): boolean;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:59](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L59)

Whether recording is currently active.

##### Returns

`boolean`

***

### recordedSequence

#### Get Signature

```ts
get recordedSequence(): HotkeySequence | null;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:69](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L69)

Last committed sequence, or null if none.

##### Returns

`HotkeySequence` \| `null`

***

### steps

#### Get Signature

```ts
get steps(): HotkeySequence;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:64](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L64)

Chords captured in the current session.

##### Returns

`HotkeySequence`

## Methods

### cancelRecording()

```ts
cancelRecording(): void;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:139](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L139)

Cancel recording without saving.

#### Returns

`void`

***

### commitRecording()

```ts
commitRecording(): void;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:144](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L144)

Commit current steps as a sequence (no-op if empty).

#### Returns

`void`

***

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:92](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L92)

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

Defined in: [controllers/hotkey-sequence-recorder.ts:114](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L114)

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

Defined in: [controllers/hotkey-sequence-recorder.ts:124](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L124)

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

Defined in: [controllers/hotkey-sequence-recorder.ts:129](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L129)

Start recording a new sequence.

#### Returns

`void`

***

### stopRecording()

```ts
stopRecording(): void;
```

Defined in: [controllers/hotkey-sequence-recorder.ts:134](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-sequence-recorder.ts#L134)

Stop recording (same as cancel but without calling onCancel).

#### Returns

`void`
