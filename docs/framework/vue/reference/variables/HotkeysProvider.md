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
  enabled: {
     default: boolean;
     type: BooleanConstructor;
  };
  exclusive: {
     default: boolean;
     type: PropType<
        | boolean
        | {
      }
       | undefined>;
  };
  scope: {
     default: undefined;
     type: StringConstructor;
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
  enabled: {
     default: boolean;
     type: BooleanConstructor;
  };
  exclusive: {
     default: boolean;
     type: PropType<
        | boolean
        | {
      }
       | undefined>;
  };
  scope: {
     default: undefined;
     type: StringConstructor;
  };
}>, {
  customHotkeysChange: (_customHotkeys) => true;
}>, {
  appHotkeys: Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>;
  customHotkeys:   | CustomHotkeys<Readonly<Record<string, AppHotkey<string, HotkeyChord | HotkeySequence | null>>>>
     | null;
  defaultOptions: HotkeysProviderOptions;
  enabled: boolean;
  exclusive:   | boolean
     | {
   }
     | undefined;
  scope: string;
}, {
}, {
}, {
}, string, ComponentProvideOptions, true, {
}, any>;
```

Defined in: [HotkeysProvider.tsx:39](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/HotkeysProvider.tsx#L39)

Vue component that provides default options, app hotkeys, and the user's
custom hotkeys. A new `customHotkeys` value replaces the current custom
hotkeys, `undefined` leaves them unchanged, and `null` clears them. Listen
to `custom-hotkeys-change` to save changes.

Nest providers to create hotkey scopes. A nested provider inherits app
hotkeys and merges default options. With `scope`, its hotkeys fire only
while it is mounted, enabled, and not hidden by `<KeepAlive>`; with
`exclusive`, only its hotkeys fire.

## Examples

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

```vue
<HotkeysProvider scope="edit-dialog" :exclusive="{ allow: ['global'] }">
  <DialogBody />
</HotkeysProvider>
```
