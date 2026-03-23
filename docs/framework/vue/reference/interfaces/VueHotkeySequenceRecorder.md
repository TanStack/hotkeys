---
id: VueHotkeySequenceRecorder
title: VueHotkeySequenceRecorder
---

# Interface: VueHotkeySequenceRecorder

Defined in: packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:11

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:17

#### Returns

`void`

***

### commitRecording()

```ts
commitRecording: () => void;
```

Defined in: packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:18

#### Returns

`void`

***

### isRecording

```ts
isRecording: Ref<boolean>;
```

Defined in: packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:12

***

### recordedSequence

```ts
recordedSequence: Ref<HotkeySequence | null>;
```

Defined in: packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:14

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:15

#### Returns

`void`

***

### steps

```ts
steps: Ref<HotkeySequence>;
```

Defined in: packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:13

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: packages/vue-hotkeys/src/useHotkeySequenceRecorder.ts:16

#### Returns

`void`
