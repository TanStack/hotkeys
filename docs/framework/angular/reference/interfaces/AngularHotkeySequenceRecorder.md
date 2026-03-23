---
id: AngularHotkeySequenceRecorder
title: AngularHotkeySequenceRecorder
---

# Interface: AngularHotkeySequenceRecorder

Defined in: [injectHotkeySequenceRecorder.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequenceRecorder.ts#L18)

## Properties

### cancelRecording()

```ts
readonly cancelRecording: () => void;
```

Defined in: [injectHotkeySequenceRecorder.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequenceRecorder.ts#L24)

#### Returns

`void`

***

### commitRecording()

```ts
readonly commitRecording: () => void;
```

Defined in: [injectHotkeySequenceRecorder.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequenceRecorder.ts#L25)

#### Returns

`void`

***

### isRecording()

```ts
readonly isRecording: () => boolean;
```

Defined in: [injectHotkeySequenceRecorder.ts:19](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequenceRecorder.ts#L19)

#### Returns

`boolean`

***

### recordedSequence()

```ts
readonly recordedSequence: () => HotkeySequence | null;
```

Defined in: [injectHotkeySequenceRecorder.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequenceRecorder.ts#L21)

#### Returns

`HotkeySequence` \| `null`

***

### startRecording()

```ts
readonly startRecording: () => void;
```

Defined in: [injectHotkeySequenceRecorder.ts:22](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequenceRecorder.ts#L22)

#### Returns

`void`

***

### steps()

```ts
readonly steps: () => HotkeySequence;
```

Defined in: [injectHotkeySequenceRecorder.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequenceRecorder.ts#L20)

#### Returns

`HotkeySequence`

***

### stopRecording()

```ts
readonly stopRecording: () => void;
```

Defined in: [injectHotkeySequenceRecorder.ts:23](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequenceRecorder.ts#L23)

#### Returns

`void`
