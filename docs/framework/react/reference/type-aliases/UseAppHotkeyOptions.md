---
id: UseAppHotkeyOptions
title: UseAppHotkeyOptions
---

```ts
type UseAppHotkeyOptions<T> = AdapterAppHotkeyOptions<T, UseHotkeyTarget>;
```

Defined in: [useHotkey.ts:42](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/useHotkey.ts#L42)

Options for an app hotkey at the call site. `meta` comes from the declaration.
Kind-specific options follow the declared default: `requireReset` for a chord,
`timeout` for a sequence, both for an app hotkey without a default. If the
user rebinds it to the other kind, options for the old kind no longer apply.

## Type Parameters

### T

`T` *extends* `AppHotkey` = `AppHotkey`
