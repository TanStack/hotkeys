---
id: createHotkeyRecorder
title: createHotkeyRecorder
---

## Call Signature

```ts
function createHotkeyRecorder(options): SvelteHotkeyRecorder<HotkeyChord>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:101](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L101)

Svelte function for recording keyboard shortcuts. Options may be a getter.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

`HotkeyChordRecorderOptions`

### Returns

[`SvelteHotkeyRecorder`](../interfaces/SvelteHotkeyRecorder.md)\<`HotkeyChord`\>

### Example

```svelte
<script lang="ts">
  const recorder = createHotkeyRecorder({ onRecord: (hotkey) => (shortcut = hotkey) })
  const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
</script>

<button onclick={recorder.startRecording}>
  {recorder.isRecording ? 'Press keys…' : formatForDisplay(shortcut)}
</button>
```

## Call Signature

```ts
function createHotkeyRecorder(options): SvelteHotkeyRecorder;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:104](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L104)

Svelte function for recording keyboard shortcuts. Options may be a getter.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

`HotkeySequenceRecorderOptions`

### Returns

[`SvelteHotkeyRecorder`](../interfaces/SvelteHotkeyRecorder.md)

### Example

```svelte
<script lang="ts">
  const recorder = createHotkeyRecorder({ onRecord: (hotkey) => (shortcut = hotkey) })
  const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
</script>

<button onclick={recorder.startRecording}>
  {recorder.isRecording ? 'Press keys…' : formatForDisplay(shortcut)}
</button>
```

## Call Signature

```ts
function createHotkeyRecorder(options): SvelteHotkeyRecorder;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:109](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L109)

Svelte function for recording keyboard shortcuts. Options may be a getter.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

() => `HotkeySequenceRecorderOptions`

### Returns

[`SvelteHotkeyRecorder`](../interfaces/SvelteHotkeyRecorder.md)

### Example

```svelte
<script lang="ts">
  const recorder = createHotkeyRecorder({ onRecord: (hotkey) => (shortcut = hotkey) })
  const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
</script>

<button onclick={recorder.startRecording}>
  {recorder.isRecording ? 'Press keys…' : formatForDisplay(shortcut)}
</button>
```

## Call Signature

```ts
function createHotkeyRecorder(options): SvelteHotkeyRecorder<HotkeyChord>;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:112](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L112)

Svelte function for recording keyboard shortcuts. Options may be a getter.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

() => `HotkeyChordRecorderOptions`

### Returns

[`SvelteHotkeyRecorder`](../interfaces/SvelteHotkeyRecorder.md)\<`HotkeyChord`\>

### Example

```svelte
<script lang="ts">
  const recorder = createHotkeyRecorder({ onRecord: (hotkey) => (shortcut = hotkey) })
  const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
</script>

<button onclick={recorder.startRecording}>
  {recorder.isRecording ? 'Press keys…' : formatForDisplay(shortcut)}
</button>
```

## Call Signature

```ts
function createHotkeyRecorder(options): SvelteHotkeyRecorder;
```

Defined in: [packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts:115](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/createHotkeyRecorder.svelte.ts#L115)

Svelte function for recording keyboard shortcuts. Options may be a getter.

With the default `maxSteps: 1`, the first valid chord is recorded. With a
larger `maxSteps`, each chord adds a step; the recording commits on Enter
(unless `commitKeys: 'none'`), after `idleTimeoutMs`, or at `maxSteps`, and
`onRecord` receives a chord (one step) or a sequence.

### Parameters

#### options

() => `HotkeyRecorderOptions`

### Returns

[`SvelteHotkeyRecorder`](../interfaces/SvelteHotkeyRecorder.md)

### Example

```svelte
<script lang="ts">
  const recorder = createHotkeyRecorder({ onRecord: (hotkey) => (shortcut = hotkey) })
  const sequenceRecorder = createHotkeyRecorder({ maxSteps: Infinity, onRecord: save })
</script>

<button onclick={recorder.startRecording}>
  {recorder.isRecording ? 'Press keys…' : formatForDisplay(shortcut)}
</button>
```
