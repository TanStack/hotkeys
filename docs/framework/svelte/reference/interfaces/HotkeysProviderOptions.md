---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:21](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L21)

## Properties

### hotkey?

```ts
optional hotkey?: CreateHotkeyCommonOptions;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L32)

Defaults for every hotkey registered by `createHotkey` and `createHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:34](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L34)

Defaults for every `createHotkeyRecorder`.

***

### platform?

```ts
optional platform?: HotkeyPlatform;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L27)

The user's platform, for labels from `getFormatForDisplay`, hotkeys, and
recorders. On a server, set it from the request with
`detectPlatform(userAgent)`.
