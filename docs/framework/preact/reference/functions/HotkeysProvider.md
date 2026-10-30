---
id: HotkeysProvider
title: HotkeysProvider
---

```ts
function HotkeysProvider<T>(__namedParameters): Element;
```

Defined in: [HotkeysProvider.tsx:104](https://github.com/TanStack/hotkeys/blob/main/packages/preact-hotkeys/src/HotkeysProvider.tsx#L104)

Provides default options, app hotkeys, and the user's custom hotkeys.

Nest providers to create hotkey scopes. A nested provider inherits app
hotkeys and merges default options. With `scope`, its hotkeys fire only
while it is mounted and enabled; with `exclusive`, only its hotkeys fire.

## Type Parameters

### T

`T` *extends* `Readonly`\<`Record`\<`string`, `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>\> = `Readonly`\<`Record`\<`string`, `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>\>

## Parameters

### \_\_namedParameters

[`HotkeysProviderProps`](../interfaces/HotkeysProviderProps.md)\<`T`\>

## Returns

`Element`

## Examples

```tsx
<HotkeysProvider
  appHotkeys={appHotkeys}
  customHotkeys={JSON.parse(localStorage.getItem('hotkeys') ?? '{}')}
  onCustomHotkeysChange={(custom) =>
    localStorage.setItem('hotkeys', JSON.stringify(custom))
  }
>
  <App />
</HotkeysProvider>
```

```tsx
function EditDialog() {
  return (
    <HotkeysProvider scope="edit-dialog" exclusive={{ allow: ['global'] }}>
      <DialogBody />
    </HotkeysProvider>
  )
}
```
