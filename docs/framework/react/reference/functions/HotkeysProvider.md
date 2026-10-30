---
id: HotkeysProvider
title: HotkeysProvider
---

```ts
function HotkeysProvider<T>(__namedParameters): ReactElement;
```

Defined in: [HotkeysProvider.tsx:111](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L111)

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

`ReactElement`

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
