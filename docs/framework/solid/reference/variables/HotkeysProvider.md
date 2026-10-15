---
id: HotkeysProvider
title: HotkeysProvider
---

```ts
const HotkeysProvider: ParentComponent<HotkeysProviderProps>;
```

Defined in: [HotkeysProvider.tsx:75](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/HotkeysProvider.tsx#L75)

Provides default options, app hotkeys, and the user's custom hotkeys.

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
