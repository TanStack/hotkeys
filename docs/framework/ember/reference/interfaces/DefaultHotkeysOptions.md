---
id: DefaultHotkeysOptions
title: DefaultHotkeysOptions
---

Defined in: [packages/ember-hotkeys/src/types.ts:85](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L85)

Shared defaults; call-specific options take precedence.

## Properties

### hotkey?

```ts
optional hotkey?: EmberHotkeyCommonOptions;
```

Defined in: [packages/ember-hotkeys/src/types.ts:87](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L87)

Defaults for every hotkey. `requireReset` applies to chords and `timeout` to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [packages/ember-hotkeys/src/types.ts:89](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L89)

Defaults for every recorder.
