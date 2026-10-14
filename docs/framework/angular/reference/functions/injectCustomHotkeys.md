---
id: injectCustomHotkeys
title: injectCustomHotkeys
---

```ts
function injectCustomHotkeys(): InjectCustomHotkeysResult;
```

Defined in: injectAppHotkeys.ts:90

Reads and changes the user's custom hotkeys. Changes apply to every
registered app hotkey immediately and are passed to `onCustomHotkeysChange`
from `provideHotkeys`, ready to save.

## Returns

[`InjectCustomHotkeysResult`](../interfaces/InjectCustomHotkeysResult.md)
