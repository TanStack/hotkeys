---
id: RecorderRejection
title: RecorderRejection
---

Defined in: [hotkey-recorder.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L26)

## Properties

### conflicts?

```ts
optional conflicts?: HotkeyConflict[];
```

Defined in: [hotkey-recorder.ts:31](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L31)

***

### hotkey?

```ts
optional hotkey?: Hotkey;
```

Defined in: [hotkey-recorder.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L30)

The rejected chord or sequence, when one was recorded.

***

### message

```ts
message: string;
```

Defined in: [hotkey-recorder.ts:28](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L28)

***

### reason

```ts
reason: "invalid" | "missing-code" | "alt-graph" | "conflict" | "validation";
```

Defined in: [hotkey-recorder.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L27)
