---
id: HotkeysProviderOptions
title: HotkeysProviderOptions
---

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:20](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L20)

## Properties

### hotkey?

```ts
optional hotkey?: CreateHotkeyCommonOptions;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L31)

Defaults for every hotkey registered by `createHotkey` and `createHotkeys`.
`requireReset` applies to chords and `timeout` applies to sequences.

***

### hotkeyRecorder?

```ts
optional hotkeyRecorder?: Partial<Omit<HotkeyChordRecorderOptions & HotkeySequenceRecorderOptions, "maxSteps" | "validate" | "onRecord">>;
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:33](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L33)

Defaults for every `createHotkeyRecorder`.

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [packages/svelte-hotkeys/src/HotkeysCtx.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/svelte-hotkeys/src/HotkeysCtx.ts#L26)

The user's platform, for labels from `getFormatForDisplay`, hotkeys, and
recorders. On a server, set it from the request with
`detectPlatform(userAgent)`.
