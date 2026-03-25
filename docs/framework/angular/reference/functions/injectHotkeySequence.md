---
id: injectHotkeySequence
title: injectHotkeySequence
---

# Function: injectHotkeySequence()

```ts
function injectHotkeySequence(
   sequence, 
   callback, 
   options): void;
```

Defined in: [injectHotkeySequence.ts:58](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequence.ts#L58)

Angular inject-based API for registering a keyboard shortcut sequence (Vim-style).

Allows you to register multi-key sequences like 'g g' or 'd d' that trigger
when the full sequence is pressed within a timeout.

Each step may include modifiers. You can chain the same modifier across
steps (e.g. `Shift+R` then `Shift+T`). Modifier-only keydown events (Shift,
Control, Alt, or Meta pressed alone) are ignored while matching—they do not
advance the sequence or reset progress.

## Parameters

### sequence

Array of hotkey strings that form the sequence (or getter function)

`HotkeySequence` | () => `HotkeySequence`

### callback

`HotkeyCallback`

Function to call when the sequence is completed

### options

Options for the sequence behavior (or getter function). `enabled: false` still registers
  the sequence (visible in devtools); only execution is suppressed.

[`InjectHotkeySequenceOptions`](../interfaces/InjectHotkeySequenceOptions.md) | () => [`InjectHotkeySequenceOptions`](../interfaces/InjectHotkeySequenceOptions.md)

## Returns

`void`

## Example

```ts
@Component({ ... })
export class VimEditorComponent {
  lastSequence = signal<string | null>(null)

  constructor() {
    injectHotkeySequence(['G', 'G'], () => this.lastSequence.set('gg → Go to top'))
    injectHotkeySequence(['D', 'D'], () => this.lastSequence.set('dd → Delete line'))
    injectHotkeySequence(['C', 'I', 'W'], () => this.lastSequence.set('ciw'), { timeout: 500 })
    injectHotkeySequence(['Shift+R', 'Shift+T'], () => this.lastSequence.set('⇧R⇧T'))
  }
}
```
