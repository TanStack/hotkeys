---
id: HotkeysProvider
title: HotkeysProvider
---

# Variable: HotkeysProvider

```ts
const HotkeysProvider: DefineComponent<ExtractPropTypes<{
  defaultOptions: {
     default: undefined;
     type: () => HotkeysProviderOptions;
  };
}>, () => 
  | VNode<RendererNode, RendererElement, {
[key: string]: any;
}>[]
  | undefined, {
}, {
}, {
}, ComponentOptionsMixin, ComponentOptionsMixin, {
}, string, PublicProps, ToResolvedProps<ExtractPropTypes<{
  defaultOptions: {
     default: undefined;
     type: () => HotkeysProviderOptions;
  };
}>, {
}>, {
  defaultOptions: HotkeysProviderOptions;
}, {
}, {
}, {
}, string, ComponentProvideOptions, true, {
}, any>;
```

Defined in: [packages/vue-hotkeys/src/HotkeysProvider.tsx:17](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProvider.tsx#L17)

Vue component that provides default options for hotkeys context.

## Example

```vue
<template>
  <HotkeysProvider :defaultOptions="{ hotkey: { enabled: true } }">
    <App />
  </HotkeysProvider>
</template>
```
