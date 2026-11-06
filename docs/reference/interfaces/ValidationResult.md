---
id: ValidationResult
title: ValidationResult
---

Defined in: [validate.ts:212](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L212)

Result of validating a hotkey string.

## Properties

### errors

```ts
errors: HotkeyIssue[];
```

Defined in: [validate.ts:218](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L218)

Problems that stop the hotkey from registering

***

### valid

```ts
valid: boolean;
```

Defined in: [validate.ts:214](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L214)

Whether the hotkey is valid (can still have warnings)

***

### warnings

```ts
warnings: HotkeyIssue[];
```

Defined in: [validate.ts:216](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L216)

Problems that may stop the hotkey from firing, such as an unknown key
