---
id: ValidationResult
title: ValidationResult
---

Defined in: [validate.ts:172](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L172)

Result of validating a hotkey string.

## Properties

### errors

```ts
errors: string[];
```

Defined in: [validate.ts:178](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L178)

Error messages about invalid syntax

***

### valid

```ts
valid: boolean;
```

Defined in: [validate.ts:174](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L174)

Whether the hotkey is valid (can still have warnings)

***

### warnings

```ts
warnings: string[];
```

Defined in: [validate.ts:176](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L176)

Warning messages about potential issues
