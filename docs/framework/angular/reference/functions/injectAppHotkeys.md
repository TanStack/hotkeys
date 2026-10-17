---
id: injectAppHotkeys
title: injectAppHotkeys
---

```ts
function injectAppHotkeys(): Signal<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>;
```

Defined in: [injectAppHotkeys.ts:38](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectAppHotkeys.ts#L38)

Returns a signal of the effective app hotkeys from `provideHotkeys`, typed
by `Register`: each declaration with the user's custom hotkey applied.

## Returns

`Signal`\<`Readonly`\<`Record`\<`string`, `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>\>\>

## Example

```ts
appHotkeys = injectAppHotkeys()
constructor() {
  injectHotkey(() => this.appHotkeys()['doc.save'], () => this.save())
}
```
