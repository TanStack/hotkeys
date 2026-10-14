---
id: getAppHotkeyList
title: getAppHotkeyList
---

```ts
function getAppHotkeyList(): SvelteAppHotkeyList;
```

Defined in: packages/svelte-hotkeys/src/getAppHotkeys.svelte.ts:63

Lists every app hotkey with its live status, for cheat sheets and settings
screens. App hotkeys whose components have not mounted are `'inactive'`;
those without a hotkey are `'unbound'`.

## Returns

[`SvelteAppHotkeyList`](../interfaces/SvelteAppHotkeyList.md)
