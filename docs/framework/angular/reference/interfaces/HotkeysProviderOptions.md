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

Defined in: [hotkeys-provider.ts:36](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L36)

Defaults for every hotkey registered by `injectHotkey` and `injectHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [hotkeys-provider.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L38)

Defaults for every `injectHotkeyRecorder`.
