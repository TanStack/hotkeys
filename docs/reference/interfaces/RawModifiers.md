---
id: RawModifiers
title: RawModifiers
---

Defined in: [hotkey.types.ts:163](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L163)

Modifier flags shared by logical-key and physical-code registrations.

## Properties

### alt?

```ts
optional alt?: boolean;
```

Defined in: [hotkey.types.ts:171](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L171)

Whether the Alt key is required. Defaults to false.

***

### ctrl?

```ts
optional ctrl?: boolean;
```

Defined in: [hotkey.types.ts:167](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L167)

Whether the Control key is required. Defaults to false.

***

### meta?

```ts
optional meta?: boolean;
```

Defined in: [hotkey.types.ts:173](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L173)

Whether the Meta (Command) key is required. Defaults to false.

***

### mod?

```ts
optional mod?: boolean;
```

Defined in: [hotkey.types.ts:165](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L165)

Platform-adaptive modifier: Command on macOS, Control on Windows/Linux. Defaults to false.

***

### shift?

```ts
optional shift?: boolean;
```

Defined in: [hotkey.types.ts:169](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L169)

Whether the Shift key is required. Defaults to false.
