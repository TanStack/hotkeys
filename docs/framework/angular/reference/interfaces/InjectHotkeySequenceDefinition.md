---
id: InjectHotkeySequenceDefinition
title: InjectHotkeySequenceDefinition
---

# Interface: InjectHotkeySequenceDefinition

Defined in: [injectHotkeySequences.ts:14](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequences.ts#L14)

A single sequence definition for use with `injectHotkeySequences`.

## Properties

### callback

```ts
callback: HotkeyCallback;
```

Defined in: [injectHotkeySequences.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequences.ts#L18)

The function to call when the sequence is completed

***

### options?

```ts
optional options: 
  | InjectHotkeySequenceOptions
  | () => InjectHotkeySequenceOptions;
```

Defined in: [injectHotkeySequences.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequences.ts#L20)

Per-sequence options (merged on top of commonOptions)

***

### sequence

```ts
sequence: HotkeySequence | () => HotkeySequence;
```

Defined in: [injectHotkeySequences.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequences.ts#L16)

Array of hotkey strings that form the sequence
