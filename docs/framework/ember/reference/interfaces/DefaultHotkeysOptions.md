---
id: DefaultHotkeysOptions
title: DefaultHotkeysOptions
---

Defined in: [packages/ember-hotkeys/src/types.ts:86](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L86)

Shared defaults; call-specific options take precedence.

## Properties

### hotkey?

```ts
optional hotkey?: EmberHotkeyCommonOptions;
```

Defined in: [packages/ember-hotkeys/src/types.ts:95](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L95)

Defaults for every hotkey. `requireReset` applies to chords and `timeout` to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [packages/ember-hotkeys/src/types.ts:97](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L97)

Defaults for every recorder.

***

### platform?

```ts
optional platform?: HotkeyPlatform;
```

Defined in: [packages/ember-hotkeys/src/types.ts:93](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L93)

The user's platform, for labels from `useFormatForDisplay`, hotkeys, and
recorders. `hotkey.platform` and `hotkeyRecorder.platform` win. Detected
when unset. On a server, set it from the request with
`detectPlatform(userAgent)`.
