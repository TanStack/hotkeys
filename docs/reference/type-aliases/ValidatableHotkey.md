---
id: ValidatableHotkey
title: ValidatableHotkey
---

```ts
type ValidatableHotkey = Hotkey | string & object | ReadonlyArray<string>;
```

Defined in: [validate.ts:10](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/validate.ts#L10)

A hotkey to validate: a chord string, a sequence, or untyped input such as saved data.
