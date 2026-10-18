---
id: useHotkeyRecorder
title: useHotkeyRecorder
---

## Call Signature

```ts
function useHotkeyRecorder(options): PreactHotkeyRecorder<HotkeyChord>;
```

Defined in: [useHotkeyRecorder.ts:68](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeyRecorder.ts#L68)

Preact hook for recording keyboard shortcuts.

With the default `maxSteps: 1`, the first valid chord is recorded and
`onRecord` receives a chord such as `'Mod+S'`. With a larger `maxSteps`, each
chord adds a step; the recording commits on Enter (unless
`commitKeys: 'none'`), after `idleTimeoutMs`, or when it reaches `maxSteps`,
and `onRecord` receives a chord (one step) or a sequence.

Escape cancels. Backspace/Delete removes the last step, or calls `onClear`
when nothing is recorded.

### Parameters

#### options

`HotkeyChordRecorderOptions`

Configuration options for the recorder

### Returns

[`PreactHotkeyRecorder`](../interfaces/PreactHotkeyRecorder.md)\<`HotkeyChord`\>

The recorder state and controls

### Examples

```tsx
function ShortcutInput() {
  const [shortcut, setShortcut] = useState<Hotkey>('Mod+S')
  const recorder = useHotkeyRecorder({ onRecord: setShortcut })

  return (
    <button onClick={recorder.startRecording}>
      {recorder.isRecording ? 'Press keys…' : formatForDisplay(shortcut)}
    </button>
  )
}
```

```tsx
const recorder = useHotkeyRecorder({
  maxSteps: Infinity,
  onRecord: (hotkey) => setShortcut(hotkey), // 'Mod+S' or ['G', 'H']
})
```

## Call Signature

```ts
function useHotkeyRecorder(options): PreactHotkeyRecorder;
```

Defined in: [useHotkeyRecorder.ts:71](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/useHotkeyRecorder.ts#L71)

Preact hook for recording keyboard shortcuts.

With the default `maxSteps: 1`, the first valid chord is recorded and
`onRecord` receives a chord such as `'Mod+S'`. With a larger `maxSteps`, each
chord adds a step; the recording commits on Enter (unless
`commitKeys: 'none'`), after `idleTimeoutMs`, or when it reaches `maxSteps`,
and `onRecord` receives a chord (one step) or a sequence.

Escape cancels. Backspace/Delete removes the last step, or calls `onClear`
when nothing is recorded.

### Parameters

#### options

`HotkeySequenceRecorderOptions`

Configuration options for the recorder

### Returns

[`PreactHotkeyRecorder`](../interfaces/PreactHotkeyRecorder.md)

The recorder state and controls

### Examples

```tsx
function ShortcutInput() {
  const [shortcut, setShortcut] = useState<Hotkey>('Mod+S')
  const recorder = useHotkeyRecorder({ onRecord: setShortcut })

  return (
    <button onClick={recorder.startRecording}>
      {recorder.isRecording ? 'Press keys…' : formatForDisplay(shortcut)}
    </button>
  )
}
```

```tsx
const recorder = useHotkeyRecorder({
  maxSteps: Infinity,
  onRecord: (hotkey) => setShortcut(hotkey), // 'Mod+S' or ['G', 'H']
})
```
