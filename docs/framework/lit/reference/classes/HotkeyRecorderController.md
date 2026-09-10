---
id: HotkeyRecorderController
title: HotkeyRecorderController
---

# Class: HotkeyRecorderController

Defined in: [controllers/hotkey-recorder.ts:40](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L40)

A Lit ReactiveController that records keyboard shortcuts.

Wraps the framework-agnostic `HotkeyRecorder` class, managing all the
complexity of capturing keyboard events, converting them to hotkey strings,
and handling edge cases like Escape to cancel or Backspace/Delete to clear.

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
new HotkeyRecorderController(_host, _options): HotkeyRecorderController;
```

Defined in: [controllers/hotkey-recorder.ts:64](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L64)

#### Parameters

##### \_host

`ReactiveControllerHost`

The Lit component that owns this controller.

##### \_options

`HotkeyRecorderOptions`

Configuration options for the recorder.

#### Returns

`HotkeyRecorderController`

## Accessors

### isRecording

#### Get Signature

```ts
get isRecording(): boolean;
```

Defined in: [controllers/hotkey-recorder.ts:51](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L51)

Whether recording is currently active.

##### Returns

`boolean`

***

### recordedHotkey

#### Get Signature

```ts
get recordedHotkey(): Hotkey | null;
```

Defined in: [controllers/hotkey-recorder.ts:56](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L56)

The currently recorded hotkey (for live preview).

##### Returns

`Hotkey` \| `null`

## Methods

### cancelRecording()

```ts
cancelRecording(): void;
```

Defined in: [controllers/hotkey-recorder.ts:117](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L117)

Cancel recording without saving.

#### Returns

`void`

***

### hostConnected()

```ts
hostConnected(): void;
```

Defined in: [controllers/hotkey-recorder.ts:73](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L73)

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

Defined in: [controllers/hotkey-recorder.ts:92](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L92)

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

Defined in: [controllers/hotkey-recorder.ts:101](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L101)

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

Defined in: [controllers/hotkey-recorder.ts:107](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L107)

Start recording a new hotkey.

#### Returns

`void`

***

### stopRecording()

```ts
stopRecording(): void;
```

Defined in: [controllers/hotkey-recorder.ts:112](https://github.com/TanStack/hotkeys/blob/main/packages/lit-hotkeys/src/controllers/hotkey-recorder.ts#L112)

Stop recording (same as cancel but without calling onCancel).

#### Returns

`void`
