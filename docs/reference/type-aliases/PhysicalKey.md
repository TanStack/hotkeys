---
id: PhysicalKey
title: PhysicalKey
---

```ts
type PhysicalKey = `[${PhysicalKeyCode}]`;
```

Defined in: [key.types.ts:244](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/key.types.ts#L244)

An explicit physical key token. All codes use brackets, including names such
as `[Enter]` that also exist as logical keys. Invalid code names are rejected
by TypeScript, and supported names are available in autocomplete.
