---
id: ValidationResult
title: ValidationResult
---

Defined in: [validate.ts:209](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L209)

Result of validating a hotkey string.

## Properties

### errors

```ts
errors: string[];
```

Defined in: [validate.ts:215](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L215)

Error messages about invalid syntax

***

### valid

```ts
valid: boolean;
```

Defined in: [validate.ts:211](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L211)

Whether the hotkey is valid (can still have warnings)

***

### warnings

```ts
warnings: string[];
```

Defined in: [validate.ts:213](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L213)

Warning messages about potential issues
