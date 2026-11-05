---
id: ValidationResult
title: ValidationResult
---

Defined in: [validate.ts:193](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L193)

Result of validating a hotkey string.

## Properties

### errors

```ts
errors: string[];
```

Defined in: [validate.ts:199](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L199)

Error messages about invalid syntax

***

### valid

```ts
valid: boolean;
```

Defined in: [validate.ts:195](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L195)

Whether the hotkey is valid (can still have warnings)

***

### warnings

```ts
warnings: string[];
```

Defined in: [validate.ts:197](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L197)

Warning messages about potential issues
