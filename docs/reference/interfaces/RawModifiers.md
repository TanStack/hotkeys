---
id: RawModifiers
title: RawModifiers
---

Defined in: [hotkey.types.ts:185](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L185)

Modifier flags shared by logical-key and physical-code registrations.

## Properties

### alt?

```ts
optional alt: boolean;
```

Defined in: [hotkey.types.ts:194](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L194)

Whether the Alt key is required. Defaults to false.

***

### ctrl?

```ts
optional ctrl: boolean;
```

Defined in: [hotkey.types.ts:190](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L190)

Whether the Control key is required. Defaults to false.

***

### meta?

```ts
optional meta: boolean;
```

Defined in: [hotkey.types.ts:196](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L196)

Whether the Meta (Command) key is required. Defaults to false.

***

### mod?

```ts
optional mod: boolean;
```

Defined in: [hotkey.types.ts:188](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L188)

Platform-adaptive modifier: Command on macOS, Control on Windows/Linux. Defaults to false.

***

### shift?

```ts
optional shift: boolean;
```

Defined in: [hotkey.types.ts:192](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L192)

Whether the Shift key is required. Defaults to false.
