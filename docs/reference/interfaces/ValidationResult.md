---
id: ValidationResult
title: ValidationResult
---

# Interface: ValidationResult

Defined in: [hotkey.ts:398](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L398)

Result of validating a hotkey string.

## Properties

### errors

```ts
errors: string[];
```

Defined in: [hotkey.ts:404](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L404)

Error messages about invalid syntax

***

### valid

```ts
valid: boolean;
```

Defined in: [hotkey.ts:400](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L400)

Whether the hotkey is valid (can still have warnings)

***

### warnings

```ts
warnings: string[];
```

Defined in: [hotkey.ts:402](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L402)

Warning messages about potential issues
