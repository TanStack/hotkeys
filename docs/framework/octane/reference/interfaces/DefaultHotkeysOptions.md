---
id: DefaultHotkeysOptions
title: DefaultHotkeysOptions
---

Defined in: [HotkeysProvider.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L27)

## Properties

### hotkey?

```ts
optional hotkey?: UseHotkeyCommonOptions;
```

Defined in: [HotkeysProvider.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L38)

Defaults for every hotkey registered by `useHotkey` and `useHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [HotkeysProvider.ts:40](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L40)

Defaults for every `useHotkeyRecorder`.

***

### platform?

```ts
optional platform?: HotkeyPlatform;
```

Defined in: [HotkeysProvider.ts:33](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L33)

The user's platform, for labels from `useFormatForDisplay`, hotkeys, and
recorders. Defaults to detection. When server rendering, set it from the
request with `detectPlatform(userAgent)`.
