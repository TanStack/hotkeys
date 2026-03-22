---
id: injectHotkeys
title: injectHotkeys
---

# Function: injectHotkeys()

```ts
function injectHotkeys(hotkeys, commonOptions): void;
```

Defined in: [injectHotkeys.ts:76](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeys.ts#L76)

Angular inject-based API for registering multiple keyboard hotkeys at once.

Uses the singleton HotkeyManager for efficient event handling.
Accepts a dynamic array of hotkey definitions.

Call in an injection context (e.g. constructor or field initializer).
Uses effect() to track reactive dependencies and update registrations
when options or the callback change.

Options are merged in this order:
provideHotkeys defaults < commonOptions < per-definition options

## Parameters

### hotkeys

Array of hotkey definitions, or getter returning them

[`InjectHotkeyDefinition`](../interfaces/InjectHotkeyDefinition.md)[] | () => [`InjectHotkeyDefinition`](../interfaces/InjectHotkeyDefinition.md)[]

### commonOptions

Shared options for all hotkeys, or getter

[`InjectHotkeyOptions`](../interfaces/InjectHotkeyOptions.md) | () => [`InjectHotkeyOptions`](../interfaces/InjectHotkeyOptions.md)

## Returns

`void`

## Examples

```ts
@Component({ ... })
export class EditorComponent {
  constructor() {
    injectHotkeys([
      { hotkey: 'Mod+S', callback: () => this.save() },
      { hotkey: 'Mod+Z', callback: () => this.undo() },
      { hotkey: 'Escape', callback: () => this.close() },
    ])
  }
}
```

```ts
@Component({ ... })
export class DynamicShortcuts {
  shortcuts = signal([...])

  constructor() {
    injectHotkeys(
      () => this.shortcuts().map((s) => ({
        hotkey: s.key,
        callback: s.action,
      })),
    )
  }
}
```
