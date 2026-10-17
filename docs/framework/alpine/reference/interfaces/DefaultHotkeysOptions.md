---
id: DefaultHotkeysOptions
title: DefaultHotkeysOptions
---

Defined in: [types.ts:165](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L165)

Shared defaults; call-specific options take precedence.

## Properties

### hotkey?

```ts
optional hotkey?: AlpineHotkeyCommonOptions;
```

Defined in: [types.ts:167](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L167)

Defaults for every hotkey. `requireReset` applies to chords and `timeout` to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [types.ts:169](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L169)

Defaults for every recorder.
