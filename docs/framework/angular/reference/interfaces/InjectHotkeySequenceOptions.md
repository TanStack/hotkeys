---
id: InjectHotkeySequenceOptions
title: InjectHotkeySequenceOptions
---

# Interface: InjectHotkeySequenceOptions

Defined in: [injectHotkeySequence.ts:13](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequence.ts#L13)

## Extends

- `Omit`\<`SequenceOptions`, `"enabled"` \| `"target"`\>

## Properties

### enabled?

```ts
optional enabled: boolean;
```

Defined in: [injectHotkeySequence.ts:18](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequence.ts#L18)

Whether the sequence is enabled. Defaults to true.

***

### target?

```ts
optional target: HTMLElement | Document | Window | null;
```

Defined in: [injectHotkeySequence.ts:24](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequence.ts#L24)

The DOM element to attach the event listener to.
Can be a direct DOM element, an accessor target, or null.
Defaults to document when omitted.
