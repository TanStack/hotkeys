---
id: SvelteHotkeySequenceRecorder
title: SvelteHotkeySequenceRecorder
---

# Interface: SvelteHotkeySequenceRecorder

Defined in: packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:11

## Properties

### cancelRecording()

```ts
cancelRecording: () => void;
```

Defined in: packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:17

#### Returns

`void`

***

### commitRecording()

```ts
commitRecording: () => void;
```

Defined in: packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:18

#### Returns

`void`

***

### isRecording

```ts
readonly isRecording: boolean;
```

Defined in: packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:12

***

### recordedSequence

```ts
readonly recordedSequence: HotkeySequence | null;
```

Defined in: packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:14

***

### startRecording()

```ts
startRecording: () => void;
```

Defined in: packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:15

#### Returns

`void`

***

### steps

```ts
readonly steps: HotkeySequence;
```

Defined in: packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:13

***

### stopRecording()

```ts
stopRecording: () => void;
```

Defined in: packages/svelte-hotkeys/src/createHotkeySequenceRecorder.svelte.ts:16

#### Returns

`void`
