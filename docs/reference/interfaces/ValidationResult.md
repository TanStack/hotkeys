---
id: ValidationResult
title: ValidationResult
---

# Interface: ValidationResult

Defined in: [hotkey.ts:376](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L376)

Result of validating a hotkey string.

## Properties

### errors

```ts
errors: string[];
```

Defined in: [hotkey.ts:382](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L382)

Error messages about invalid syntax

***

### valid

```ts
valid: boolean;
```

Defined in: [hotkey.ts:378](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L378)

Whether the hotkey is valid (can still have warnings)

***

### warnings

```ts
warnings: string[];
```

Defined in: [hotkey.ts:380](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L380)

Warning messages about potential issues
