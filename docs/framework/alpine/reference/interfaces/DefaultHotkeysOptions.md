---
id: DefaultHotkeysOptions
title: DefaultHotkeysOptions
---

Defined in: [types.ts:172](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L172)

Shared defaults; call-specific options take precedence.

## Properties

### hotkey?

```ts
optional hotkey?: AlpineHotkeyCommonOptions;
```

Defined in: [types.ts:174](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L174)

Defaults for every hotkey. `requireReset` applies to chords and `timeout` to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [types.ts:176](https://github.com/TanStack/hotkeys/blob/main/packages/alpine-hotkeys/src/types.ts#L176)

Defaults for every recorder.
