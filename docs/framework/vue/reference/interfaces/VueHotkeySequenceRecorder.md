---
id: VueHotkeySequenceRecorder
title: VueHotkeySequenceRecorder
---

# Interface: VueHotkeySequenceRecorder

Defined in: [packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:11](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts#L11)

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: [packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts#L17)

#### Returns

`void`

***

### commitRecording()

```ts
commitRecording: () => void;
```

Defined in: [packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts#L18)

#### Returns

`void`

***

### isRecording

```ts
isRecording: Ref<boolean>;
```

Defined in: [packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts#L12)

***

### recordedSequence

```ts
recordedSequence: Ref<HotkeySequence | null>;
```

Defined in: [packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts#L14)

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: [packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:15](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts#L15)

#### Returns

`void`

***

### steps

```ts
steps: Ref<HotkeySequence>;
```

Defined in: [packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:13](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts#L13)

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: [packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts#L16)

#### Returns

`void`
