---
id: HotkeysProvider
title: HotkeysProvider
---

```ts
const HotkeysProvider: DefineComponent<ExtractPropTypes<{
  appHotkeys: {
     default: undefined;
     type: PropType<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>;
  };
  customHotkeys: {
     default: undefined;
     type: PropType<
        | CustomHotkeys<Readonly<Record<string, AppHotkey<string, ... | ... | ...>>>>
       | null>;
  };
  defaultOptions: {
     default: undefined;
     type: PropType<HotkeysProviderOptions>;
  };
}>, () => 
  | VNode<RendererNode, RendererElement, {
[key: string]: any;
}>[]
  | undefined, {
}, {
}, {
}, ComponentOptionsMixin, ComponentOptionsMixin, {
  customHotkeysChange: (_customHotkeys) => true;
}, string, PublicProps, ToResolvedProps<ExtractPropTypes<{
  appHotkeys: {
     default: undefined;
     type: PropType<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>;
  };
  customHotkeys: {
     default: undefined;
     type: PropType<
        | CustomHotkeys<Readonly<Record<string, AppHotkey<..., ...>>>>
       | null>;
  };
  defaultOptions: {
     default: undefined;
     type: PropType<HotkeysProviderOptions>;
  };
}>, {
  customHotkeysChange: (_customHotkeys) => true;
}>, {
  appHotkeys: Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>;
  customHotkeys:   | CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
     | null;
  defaultOptions: HotkeysProviderOptions;
}, {
}, {
}, {
}, string, ComponentProvideOptions, true, {
}, any>;
```

Defined in: [HotkeysProvider.tsx:25](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProvider.tsx#L25)

Vue component that provides default options, app hotkeys, and the user's
custom hotkeys. `customHotkeys` is read once; listen to
`custom-hotkeys-change` to save changes.

## Example

```vue
<template>
  <HotkeysProvider
    :app-hotkeys="appHotkeys"
    :custom-hotkeys="saved"
    @custom-hotkeys-change="save"
  >
    <App />
  </HotkeysProvider>
</template>
```
