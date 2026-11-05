---
id: RecorderRejection
title: RecorderRejection
---

Defined in: [hotkey-recorder.ts:39](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L39)

## Properties

### conflicts?

```ts
optional conflicts?: HotkeyConflict[];
```

Defined in: [hotkey-recorder.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L45)

***

### hotkey?

```ts
optional hotkey?: Hotkey;
```

Defined in: [hotkey-recorder.ts:44](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L44)

The rejected chord or sequence, when one was recorded.

***

### message?

```ts
optional message?: string;
```

Defined in: [hotkey-recorder.ts:42](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L42)

The message your `validate` callback returned, when it returned one.

***

### reason

```ts
reason: RecorderRejectionReason;
```

Defined in: [hotkey-recorder.ts:40](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L40)
