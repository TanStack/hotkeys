---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [hotkeys-provider.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L31)

## Properties

### hotkey?

```ts
optional hotkey?: InjectHotkeyCommonOptions;
```

Defined in: [hotkeys-provider.ts:42](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L42)

Defaults for every hotkey registered by `injectHotkey` and `injectHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [hotkeys-provider.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L44)

Defaults for every `injectHotkeyRecorder`.

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [hotkeys-provider.ts:37](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L37)

The user's platform, for labels from `injectFormatForDisplay`, hotkeys,
and recorders. Detected when unset. On a server, set it from the request
with `detectPlatform(userAgent)`.
