---
id: UseHotkeyOptions
title: UseHotkeyOptions
---

# Interface: UseHotkeyOptions

Defined in: [packages/vue-hotkeys/src/useHotkey.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkey.ts#L18)

## Extends

- `Omit`\<`HotkeyOptions`, `"enabled"` \| `"target"`\>

## Properties

### enabled?

```ts
optional enabled: MaybeRefOrGetter<boolean>;
```

Defined in: [packages/vue-hotkeys/src/useHotkey.ts:27](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkey.ts#L27)

Whether the hotkey is active.
Can be a Ref, a getter function, or a boolean value.
Defaults to true.

***

### target?

```ts
optional target: MaybeRefOrGetter<HTMLElement | Document | Window | null>;
```

Defined in: [packages/vue-hotkeys/src/useHotkey.ts:33](https://github.com/TanStack/hotkeys/blob/main/packages/vue-hotkeys/src/useHotkey.ts#L33)

The DOM element to attach the event listener to.
Can be a Ref, a getter function, direct DOM element, or null.
Defaults to document.
