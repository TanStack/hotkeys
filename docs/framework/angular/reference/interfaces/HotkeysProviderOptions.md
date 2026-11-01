---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [hotkeys-provider.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L32)

## Properties

### hotkey?

```ts
optional hotkey?: InjectHotkeyCommonOptions;
```

Defined in: [hotkeys-provider.ts:43](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L43)

Defaults for every hotkey registered by `injectHotkey` and `injectHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [hotkeys-provider.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L45)

Defaults for every `injectHotkeyRecorder`.

***

### platform?

```ts
optional platform?: HotkeyPlatform;
```

Defined in: [hotkeys-provider.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L38)

The user's platform, for labels from `injectFormatForDisplay`, hotkeys,
and recorders. Detected when unset. On a server, set it from the request
with `detectPlatform(userAgent)`.
