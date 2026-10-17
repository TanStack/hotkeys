---
id: AdapterAppHotkeyOptions
title: AdapterAppHotkeyOptions
---

```ts
type AdapterAppHotkeyOptions<T, TTarget> = Omit<[T["defaultHotkey"]] extends [HotkeySequence] ? AdapterSequenceOptions<TTarget> : [T["defaultHotkey"]] extends [HotkeyChord] ? AdapterChordOptions<TTarget> : AdapterCommonOptions<TTarget>, "meta">;
```

Defined in: [adapter.ts:200](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/adapter.ts#L200)

Call-site options for an app hotkey. `meta` comes from the declaration.
Kind-specific options follow the declared default: `requireReset` for a
chord, `timeout` for a sequence, both for an app hotkey without a default.
If the user rebinds it to the other kind, options for the old kind no
longer apply.

## Type Parameters

### T

`T` *extends* `AppHotkey`

### TTarget

`TTarget`
