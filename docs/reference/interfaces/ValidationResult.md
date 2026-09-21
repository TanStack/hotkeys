---
id: ValidationResult
title: ValidationResult
---

Defined in: [hotkey.ts:352](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L352)

Result of validating a hotkey string.

## Properties

### errors

```ts
errors: string[];
```

Defined in: [hotkey.ts:358](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L358)

Error messages about invalid syntax

***

### valid

```ts
valid: boolean;
```

Defined in: [hotkey.ts:354](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L354)

Whether the hotkey is valid (can still have warnings)

***

### warnings

```ts
warnings: string[];
```

Defined in: [hotkey.ts:356](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.ts#L356)

Warning messages about potential issues
