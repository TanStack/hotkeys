---
id: SolidHotkeySequenceRecorder
title: SolidHotkeySequenceRecorder
---

# Interface: SolidHotkeySequenceRecorder

Defined in: createHotkeySequenceRecorder.ts:10

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: createHotkeySequenceRecorder.ts:16

#### Returns

`void`

***

### commitRecording()

```ts
commitRecording: () => void;
```

Defined in: createHotkeySequenceRecorder.ts:17

#### Returns

`void`

***

### isRecording()

```ts
isRecording: () => boolean;
```

Defined in: createHotkeySequenceRecorder.ts:11

#### Returns

`boolean`

***

### recordedSequence()

```ts
recordedSequence: () => HotkeySequence | null;
```

Defined in: createHotkeySequenceRecorder.ts:13

#### Returns

`HotkeySequence` \| `null`

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: createHotkeySequenceRecorder.ts:14

#### Returns

`void`

***

### steps()

```ts
steps: () => HotkeySequence;
```

Defined in: createHotkeySequenceRecorder.ts:12

#### Returns

`HotkeySequence`

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: createHotkeySequenceRecorder.ts:15

#### Returns

`void`
