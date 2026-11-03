---
id: HotkeysProvider
title: HotkeysProvider
---

```ts
const HotkeysProvider: ParentComponent<HotkeysProviderProps>;
```

Defined in: [HotkeysProvider.tsx:108](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/HotkeysProvider.tsx#L108)

Provides default options, app hotkeys, and the user's custom hotkeys.

Nest providers to create hotkey scopes. A nested provider inherits app
hotkeys and merges default options. With `scope`, its hotkeys fire only
while it is mounted and enabled; with `exclusive`, only its hotkeys fire.

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
<HotkeysProvider scope="edit-dialog" exclusive={{ allow: ['global'] }}>
  <DialogBody />
</HotkeysProvider>
```
