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
  };
}>;
```

Defined in: [HotkeysProvider.ts:70](https://github.com/TanStack/hotkeys/blob/main/packages/octane-hotkeys/src/HotkeysProvider.ts#L70)

Sets defaults, app hotkeys, and custom hotkeys for descendant components.

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
  \};
\}\>
