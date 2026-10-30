---
id: ValidationResult
title: ValidationResult
---

Defined in: [validate.ts:180](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L180)

Result of validating a hotkey string.

## Properties

### errors

```ts
errors: string[];
```

Defined in: [validate.ts:186](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L186)

Error messages about invalid syntax

***

### valid

```ts
valid: boolean;
```

Defined in: [validate.ts:182](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L182)

Whether the hotkey is valid (can still have warnings)

***

### warnings

```ts
warnings: string[];
```

Defined in: [validate.ts:184](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L184)

Warning messages about potential issues
