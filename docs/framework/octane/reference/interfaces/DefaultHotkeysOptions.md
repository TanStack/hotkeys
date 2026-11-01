---
id: DefaultHotkeysOptions
title: DefaultHotkeysOptions
---

Defined in: [HotkeysProvider.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L26)

## Properties

### hotkey?

```ts
optional hotkey?: UseHotkeyCommonOptions;
```

Defined in: [HotkeysProvider.ts:37](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L37)

Defaults for every hotkey registered by `useHotkey` and `useHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [HotkeysProvider.ts:39](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L39)

Defaults for every `useHotkeyRecorder`.

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [HotkeysProvider.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L32)

The user's platform, for labels from `useFormatForDisplay`, hotkeys, and
recorders. Defaults to detection. When server rendering, set it from the
request with `detectPlatform(userAgent)`.
