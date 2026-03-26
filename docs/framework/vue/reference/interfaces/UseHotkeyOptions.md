---
id: UseHotkeyOptions
title: UseHotkeyOptions
---

# Interface: UseHotkeyOptions

Defined in: [packages/vue-hotkeys/src/useHotkey.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkey.ts#L17)

## Extends

- `Omit`\<`HotkeyOptions`, `"enabled"` \| `"target"`\>

## Properties

### enabled?

```ts
optional enabled: MaybeRefOrGetter<boolean>;
```

Defined in: [packages/vue-hotkeys/src/useHotkey.ts:26](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkey.ts#L26)

Whether the hotkey is active.
Can be a Ref, a getter function, or a boolean value.
Defaults to true.

***

### target?

```ts
optional target: MaybeRefOrGetter<HTMLElement | Document | Window | null>;
```

Defined in: [packages/vue-hotkeys/src/useHotkey.ts:32](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkey.ts#L32)

The DOM element to attach the event listener to.
Can be a Ref, a getter function, direct DOM element, or null.
Defaults to document.
