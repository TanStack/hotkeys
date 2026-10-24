---
id: getAppHotkeyRegistrationOptions
title: getAppHotkeyRegistrationOptions
---

```ts
function getAppHotkeyRegistrationOptions(appHotkey): AppHotkeyChordOptions & AppHotkeySequenceOptions & object;
```

Defined in: [app-hotkeys.ts:536](https://github.com/TanStack/hotkeys/blob/main/packages/hotkeys/src/app-hotkeys.ts#L536)

Options that adapters pass to the manager when registering an app hotkey:
declared options, scope, meta, and the app hotkey id. The manager drops options
that do not apply to the effective hotkey's kind.

## Parameters

### appHotkey

[`AppHotkey`](../interfaces/AppHotkey.md)

## Returns

[`AppHotkeyChordOptions`](../type-aliases/AppHotkeyChordOptions.md) & [`AppHotkeySequenceOptions`](../type-aliases/AppHotkeySequenceOptions.md) & `object`
