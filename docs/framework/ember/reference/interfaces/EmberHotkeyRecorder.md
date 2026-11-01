---
id: EmberHotkeyRecorder
title: EmberHotkeyRecorder
---

Defined in: [packages/ember-hotkeys/src/types.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L34)

Recording state and controls owned by the containing component.

## Type Parameters

### THotkey

`THotkey` *extends* `Hotkey` = `Hotkey`

## Properties

### cancelRecording

```ts
cancelRecording: () => void;
```

Defined in: [packages/ember-hotkeys/src/types.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L46)

Stop, clear recorder state, and call onCancel.

#### Returns

`void`

***

### commitRecording

```ts
commitRecording: () => void;
```

Defined in: [packages/ember-hotkeys/src/types.ts:48](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L48)

Commit the current steps (multi-step recordings).

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: boolean;
```

Defined in: [packages/ember-hotkeys/src/types.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L36)

Whether the recorder is listening for a shortcut.

***

### recordedHotkey

```ts
readonly recordedHotkey: THotkey | null;
```

Defined in: [packages/ember-hotkeys/src/types.ts:40](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L40)

The last committed hotkey, including brackets for physical codes.

***

### startRecording

```ts
startRecording: () => void;
```

Defined in: [packages/ember-hotkeys/src/types.ts:42](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L42)

Start a new recording session.

#### Returns

`void`

***

### steps

```ts
readonly steps: HotkeySequence;
```

Defined in: [packages/ember-hotkeys/src/types.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L38)

Chords captured so far in a multi-step recording.

***

### stopRecording

```ts
stopRecording: () => void;
```

Defined in: [packages/ember-hotkeys/src/types.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L44)

Stop and clear recorder state without calling onRecord or onCancel.

#### Returns

`void`
