---
id: RecorderRejection
title: RecorderRejection
---

Defined in: [recorder-options.ts:7](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L7)

## Properties

### conflicts?

```ts
optional conflicts?: HotkeyConflict[];
```

Defined in: [recorder-options.ts:12](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L12)

***

### hotkey?

```ts
optional hotkey?: Hotkey;
```

Defined in: [recorder-options.ts:11](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L11)

The rejected chord or sequence, when one was recorded.

***

### message

```ts
message: string;
```

Defined in: [recorder-options.ts:9](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L9)

***

### reason

```ts
reason: "invalid" | "missing-code" | "alt-graph" | "conflict" | "validation";
```

Defined in: [recorder-options.ts:8](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/recorder-options.ts#L8)
