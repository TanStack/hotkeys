---
id: HotkeysContextValue
title: HotkeysContextValue
---

Defined in: [hotkeys-provider.ts:45](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L45)

## Properties

### appHotkeysState

```ts
readonly appHotkeysState: Signal<
  | AppHotkeysState<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
| null>;
```

Defined in: [hotkeys-provider.ts:49](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L49)

Tracks app hotkeys and custom hotkeys so signals and effects re-run.

***

### appHotkeysStore

```ts
readonly appHotkeysStore: 
  | AppHotkeysStore<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
  | null;
```

Defined in: [hotkeys-provider.ts:47](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L47)

***

### defaultOptions

```ts
readonly defaultOptions: HotkeysProviderOptions;
```

Defined in: [hotkeys-provider.ts:46](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/hotkeys-provider.ts#L46)
