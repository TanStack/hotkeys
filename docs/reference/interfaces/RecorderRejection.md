---
id: RecorderRejection
title: RecorderRejection
---

Defined in: [hotkey-recorder.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L25)

## Properties

### conflicts?

```ts
optional conflicts?: HotkeyConflict[];
```

Defined in: [hotkey-recorder.ts:30](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L30)

***

### hotkey?

```ts
optional hotkey?: Hotkey;
```

Defined in: [hotkey-recorder.ts:29](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L29)

The rejected chord or sequence, when one was recorded.

***

### message

```ts
message: string;
```

Defined in: [hotkey-recorder.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L27)

***

### reason

```ts
reason: "invalid" | "missing-code" | "alt-graph" | "conflict" | "validation";
```

Defined in: [hotkey-recorder.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey-recorder.ts#L26)
