---
id: DefaultHotkeysOptions
title: DefaultHotkeysOptions
---

Defined in: [types.ts:168](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L168)

Shared defaults; call-specific options take precedence.

## Properties

### hotkey?

```ts
optional hotkey?: AlpineHotkeyCommonOptions;
```

Defined in: [types.ts:170](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L170)

Defaults for every hotkey. `requireReset` applies to chords and `timeout` to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [types.ts:172](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L172)

Defaults for every recorder.
