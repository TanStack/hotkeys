---
id: HotkeysProvider
title: HotkeysProvider
---

```ts
function HotkeysProvider<T>(__namedParameters): Element;
```

Defined in: [HotkeysProvider.tsx:75](https://github.com/TanStack/hotkeys/blob/main/packages/react-hotkeys/src/HotkeysProvider.tsx#L75)

Provides default options, app hotkeys, and the user's custom hotkeys.

## Type Parameters

### T

`T` *extends* `Readonly`\<`Record`\<`string`, `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>\> = `Readonly`\<`Record`\<`string`, `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>\>

## Parameters

### \_\_namedParameters

[`HotkeysProviderProps`](../interfaces/HotkeysProviderProps.md)\<`T`\>

## Returns

`Element`

## Example

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
