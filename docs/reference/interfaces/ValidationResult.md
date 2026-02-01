---
id: ValidationResult
title: ValidationResult
---

# Interface: ValidationResult

Defined in: [types.ts:350](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L350)

Result of validating a hotkey string.

## Properties

### errors

```ts
errors: string[];
```

Defined in: [types.ts:356](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L356)

Error messages about invalid syntax

***

### valid

```ts
valid: boolean;
```

Defined in: [types.ts:352](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L352)

Whether the hotkey is valid (can still have warnings)

***

### warnings

```ts
warnings: string[];
```

Defined in: [types.ts:354](https://github.com/TanStack/keys/blob/main/packages/keys/src/types.ts#L354)

Warning messages about potential issues
