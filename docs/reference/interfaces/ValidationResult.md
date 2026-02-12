---
id: ValidationResult
title: ValidationResult
---

# Interface: ValidationResult

Defined in: [hotkey.ts:375](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L375)

Result of validating a hotkey string.

## Properties

### errors

```ts
errors: string[];
```

Defined in: [hotkey.ts:381](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L381)

Error messages about invalid syntax

***

### valid

```ts
valid: boolean;
```

Defined in: [hotkey.ts:377](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L377)

Whether the hotkey is valid (can still have warnings)

***

### warnings

```ts
warnings: string[];
```

Defined in: [hotkey.ts:379](https://github.com/TanStack/keys/blob/main/packages/hotkeys/src/hotkey.ts#L379)

Warning messages about potential issues
