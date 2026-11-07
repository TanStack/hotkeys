---
id: RecorderOptions
title: RecorderOptions
---

Defined in: [hotkey-recorder.ts:48](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L48)

## Properties

### detectConflicts?

```ts
optional detectConflicts?: boolean | HotkeyConflictOptions;
```

Defined in: [hotkey-recorder.ts:54](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L54)

Opt in to live-registry conflicts, including sequence prefixes. Default: false.

***

### onReject?

```ts
optional onReject?: (rejection) => void;
```

Defined in: [hotkey-recorder.ts:56](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L56)

Rejected candidates leave recording active.

#### Parameters

##### rejection

[`RecorderRejection`](RecorderRejection.md)

#### Returns

`void`

***

### platform?

```ts
optional platform?: "mac" | "windows" | "linux";
```

Defined in: [hotkey-recorder.ts:52](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L52)

Platform used for Mod and AltGraph handling. Defaults to platform detection.

***

### recordBy?

```ts
optional recordBy?: RecorderKeyMode;
```

Defined in: [hotkey-recorder.ts:50](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L50)

Physical code recording is the default. Choose key to record logical characters.
