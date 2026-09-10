---
id: CreateHotkeyOptions
title: CreateHotkeyOptions
---

# Interface: CreateHotkeyOptions

Defined in: [createHotkey.ts:16](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkey.ts#L16)

## Extends

- `Omit`\<`HotkeyOptions`, `"target"`\>

## Properties

### target?

```ts
optional target: HTMLElement | Document | Window | null;
```

Defined in: [createHotkey.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/solid-hotkeys/src/createHotkey.ts#L24)

The DOM element to attach the event listener to.
Can be a direct DOM element, an accessor (for reactive targets that become
available after mount), or null. Defaults to document.
When using scoped targets, pass an accessor: () => ({ target: elementSignal() })
so the hotkey waits for the element to be attached before registering.
