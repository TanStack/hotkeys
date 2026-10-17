---
id: RegisterableHotkeySequence
title: RegisterableHotkeySequence
---

```ts
type RegisterableHotkeySequence = ReadonlyArray<RegisterableHotkeyChord>;
```

Defined in: [hotkey.types.ts:223](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/hotkey.types.ts#L223)

A sequence whose steps are chord strings or chord objects, such as
`['G', { key: 'H', shift: true }]`.
