---
id: InjectHotkeyOptions
title: InjectHotkeyOptions
---

# Interface: InjectHotkeyOptions

Defined in: [injectHotkey.ts:17](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkey.ts#L17)

## Extends

- `Omit`\<`HotkeyOptions`, `"target"`\>

## Properties

### target?

```ts
optional target: HTMLElement | Document | Window | null;
```

Defined in: [injectHotkey.ts:25](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkey.ts#L25)

The DOM element to attach the event listener to.
Can be a direct DOM element, an accessor (for reactive targets that become
available after mount), or null. Defaults to document.
When using scoped targets, pass an accessor: () => ({ target: elementSignal() })
so the hotkey waits for the element to be attached before registering.
