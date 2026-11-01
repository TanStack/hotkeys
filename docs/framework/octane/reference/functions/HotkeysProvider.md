---
id: HotkeysProvider
title: HotkeysProvider
---

```ts
function HotkeysProvider(__namedParameters): ElementDescriptor<{
  children: unknown;
  value: {
     appHotkeysStore:   | AppHotkeysStore<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
        | null;
     defaultOptions: DefaultHotkeysOptions;
     enabled: boolean;
  };
}>;
```

Defined in: [HotkeysProvider.ts:97](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L97)

Sets defaults, app hotkeys, and custom hotkeys for descendant components.

Nest providers to create hotkey scopes. A nested provider inherits app
hotkeys and merges default options. With `scope`, its hotkeys fire only
while it is mounted and enabled; with `exclusive`, only its hotkeys fire.

## Parameters

### \_\_namedParameters

[`HotkeysProviderProps`](../interfaces/HotkeysProviderProps.md)

## Returns

`ElementDescriptor`\<\{
  `children`: `unknown`;
  `value`: \{
     `appHotkeysStore`:   \| `AppHotkeysStore`\<`Readonly`\<`Record`\<`string`, `AppHotkey`\<`string`, `HotkeyChord` \| `HotkeySequence` \| `null`\>\>\>\>
        \| `null`;
     `defaultOptions`: [`DefaultHotkeysOptions`](../interfaces/DefaultHotkeysOptions.md);
     `enabled`: `boolean`;
  \};
\}\>
