---
id: SolidHotkeySequenceRecorder
title: SolidHotkeySequenceRecorder
---

# Interface: SolidHotkeySequenceRecorder

Defined in: [createHotkeySequenceRecorder.ts:10](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeySequenceRecorder.ts#L10)

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: [createHotkeySequenceRecorder.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeySequenceRecorder.ts#L16)

#### Returns

`void`

***

### commitRecording()

```ts
commitRecording: () => void;
```

Defined in: [createHotkeySequenceRecorder.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeySequenceRecorder.ts#L17)

#### Returns

`void`

***

### isRecording()

```ts
isRecording: () => boolean;
```

Defined in: [createHotkeySequenceRecorder.ts:11](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeySequenceRecorder.ts#L11)

#### Returns

`boolean`

***

### recordedSequence()

```ts
recordedSequence: () => HotkeySequence | null;
```

Defined in: [createHotkeySequenceRecorder.ts:13](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeySequenceRecorder.ts#L13)

#### Returns

`HotkeySequence` \| `null`

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: [createHotkeySequenceRecorder.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeySequenceRecorder.ts#L14)

#### Returns

`void`

***

### steps()

```ts
steps: () => HotkeySequence;
```

Defined in: [createHotkeySequenceRecorder.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeySequenceRecorder.ts#L12)

#### Returns

`HotkeySequence`

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: [createHotkeySequenceRecorder.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkeySequenceRecorder.ts#L15)

#### Returns

`void`
