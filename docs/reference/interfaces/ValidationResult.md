---
id: ValidationResult
title: ValidationResult
---

Defined in: [validate.ts:189](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L189)

Result of validating a hotkey string.

## Properties

### errors

```ts
errors: string[];
```

Defined in: [validate.ts:195](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L195)

Error messages about invalid syntax

***

### valid

```ts
valid: boolean;
```

Defined in: [validate.ts:191](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L191)

Whether the hotkey is valid (can still have warnings)

***

### warnings

```ts
warnings: string[];
```

Defined in: [validate.ts:193](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L193)

Warning messages about potential issues
