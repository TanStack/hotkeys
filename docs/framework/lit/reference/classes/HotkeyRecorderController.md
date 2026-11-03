---
id: HotkeyRecorderController
title: HotkeyRecorderController
---

Defined in: [controllers/hotkey-recorder.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L49)

A Lit ReactiveController that records keyboard shortcuts.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence. Escape cancels;
Backspace/Delete removes the last step or clears.

## Example

```ts
class ShortcutSettings extends LitElement {
  private recorder = new HotkeyRecorderController(this, {
    onRecord: (hotkey) => {
      this.shortcut = hotkey
      this.requestUpdate()
    },
    onCancel: () => {
      console.log('Recording cancelled')
    },
  })

  private shortcut: Hotkey | null = null

  render() {
    return html`
      <button @click=${() => this.recorder.startRecording()}>
        ${this.recorder.isRecording ? 'Recording...' : 'Edit Shortcut'}
      </button>
      ${this.recorder.recordedHotkey
        ? html`<div>Recording: ${this.recorder.recordedHotkey}</div>`
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
new HotkeyRecorderController(host, options): HotkeyRecorderController;
```

Defined in: [controllers/hotkey-recorder.ts:81](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L81)

#### Parameters

##### host

`ReactiveControllerHost`

The Lit component that owns this controller.

##### options

`HotkeyChordRecorderOptions`

Options or a getter, read during recording.

#### Returns

`HotkeyRecorderController`

### Constructor

```ts
new HotkeyRecorderController(host, options): HotkeyRecorderController;
```

Defined in: [controllers/hotkey-recorder.ts:82](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L82)

#### Parameters

##### host

`ReactiveControllerHost`

##### options

`HotkeySequenceRecorderOptions`

#### Returns

`HotkeyRecorderController`

### Constructor

```ts
new HotkeyRecorderController(host, options): HotkeyRecorderController;
```

Defined in: [controllers/hotkey-recorder.ts:89](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L89)

#### Parameters

##### host

`ReactiveControllerHost`

##### options

() => `HotkeySequenceRecorderOptions`

#### Returns

`HotkeyRecorderController`

### Constructor

```ts
new HotkeyRecorderController(host, options): HotkeyRecorderController;
```

Defined in: [controllers/hotkey-recorder.ts:93](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L93)

#### Parameters

##### host

`ReactiveControllerHost`

##### options

() => `HotkeyChordRecorderOptions`

#### Returns

`HotkeyRecorderController`

### Constructor

```ts
new HotkeyRecorderController(host, options): HotkeyRecorderController;
```

Defined in: [controllers/hotkey-recorder.ts:97](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L97)

#### Parameters

##### host

`ReactiveControllerHost`

##### options

() => `HotkeyRecorderOptions`

#### Returns

`HotkeyRecorderController`

## Accessors

### isRecording

#### Get Signature

```ts
get isRecording(): boolean;
```

Defined in: [controllers/hotkey-recorder.ts:63](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L63)

Whether recording is currently active.

##### Returns

`boolean`

***

### recordedHotkey

#### Get Signature

```ts
get recordedHotkey(): Hotkey | null;
```

Defined in: [controllers/hotkey-recorder.ts:68](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L68)

The last committed hotkey: a chord, or a sequence of two or more steps.

##### Returns

`Hotkey` \| `null`

***

### steps

#### Get Signature

```ts
get steps(): HotkeySequence;
```

Defined in: [controllers/hotkey-recorder.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L73)

Chords recorded so far in a multi-step recording (for live preview).

##### Returns

`HotkeySequence`

## Methods

### cancelRecording()

```ts
cancelRecording(): void;
```

Defined in: [controllers/hotkey-recorder.ts:171](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L171)

Cancel recording without saving.

#### Returns

`void`

***

### commitRecording()

```ts
commitRecording(): void;
```

Defined in: [controllers/hotkey-recorder.ts:176](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L176)

Commit the recorded steps now (multi-step recordings).

#### Returns

`void`

***

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/hotkey-recorder.ts:119](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L119)

Subscribes to the recorder store and updates the internal state when changes occur.

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

Defined in: [controllers/hotkey-recorder.ts:143](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L143)

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

Defined in: [controllers/hotkey-recorder.ts:153](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L153)

Updates the recorder options (e.g. callbacks).

#### Parameters

##### options

`Partial`\<`HotkeyRecorderOptions`\>

#### Returns

`void`

***

### startRecording()

```ts
startRecording(): void;
```

Defined in: [controllers/hotkey-recorder.ts:161](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L161)

Start recording a new hotkey.

#### Returns

`void`

***

### stopRecording()

```ts
stopRecording(): void;
```

Defined in: [controllers/hotkey-recorder.ts:166](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L166)

Stop recording (same as cancel but without calling onCancel).

#### Returns

`void`
