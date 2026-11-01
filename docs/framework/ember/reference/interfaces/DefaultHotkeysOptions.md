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

Defined in: [packages/ember-hotkeys/src/types.ts:94](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L94)

Defaults for every hotkey. `requireReset` applies to chords and `timeout` to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [packages/ember-hotkeys/src/types.ts:96](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L96)

Defaults for every recorder.

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [packages/ember-hotkeys/src/types.ts:92](https://github.com/TanStack/hotkeys/blob/main/packages/ember-hotkeys/src/types.ts#L92)

The user's platform, for labels from `useFormatForDisplay`, hotkeys, and
recorders. `hotkey.platform` and `hotkeyRecorder.platform` win. Detected
when unset. On a server, set it from the request with
`detectPlatform(userAgent)`.
