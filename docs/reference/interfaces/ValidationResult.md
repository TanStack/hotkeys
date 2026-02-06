---
id: ValidationResult
title: ValidationResult
---

# Interface: ValidationResult

Defined in: [hotkey.ts:334](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey.ts#L334)

Result of validating a hotkey string.

## Properties

### errors

```ts
errors: string[];
```

Defined in: [hotkey.ts:340](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey.ts#L340)

Error messages about invalid syntax

***

### valid

```ts
valid: boolean;
```

Defined in: [hotkey.ts:336](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey.ts#L336)

Whether the hotkey is valid (can still have warnings)

***

### warnings

```ts
warnings: string[];
```

Defined in: [hotkey.ts:338](https://github.com/TanStack/keys/blob/main/packages/keys/src/hotkey.ts#L338)

Warning messages about potential issues
