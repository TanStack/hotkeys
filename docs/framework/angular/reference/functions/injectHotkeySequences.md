---
id: injectHotkeySequences
title: injectHotkeySequences
---

# Function: injectHotkeySequences()

```ts
function injectHotkeySequences(sequences, commonOptions): void;
```

Defined in: [injectHotkeySequences.ts:51](https://github.com/TanStack/hotkeys/blob/main/packages/angular-hotkeys/src/injectHotkeySequences.ts#L51)

Angular inject-based API for registering multiple keyboard shortcut sequences at once (Vim-style).

Uses the singleton SequenceManager. Call in an injection context (e.g. constructor).
Uses `effect()` to track reactive dependencies when definitions or options are getters.

Options are merged in this order:
provideHotkeys defaults < commonOptions < per-definition options

Definitions with an empty `sequence` are skipped. Disabled sequences (`enabled: false`)
remain registered so they stay visible in devtools; the core manager suppresses execution.

## Parameters

### sequences

Array of sequence definitions, or getter returning them

[`InjectHotkeySequenceDefinition`](../interfaces/InjectHotkeySequenceDefinition.md)[] | () => [`InjectHotkeySequenceDefinition`](../interfaces/InjectHotkeySequenceDefinition.md)[]

### commonOptions

Shared options for all sequences, or getter

[`InjectHotkeySequenceOptions`](../interfaces/InjectHotkeySequenceOptions.md) | () => [`InjectHotkeySequenceOptions`](../interfaces/InjectHotkeySequenceOptions.md)

## Returns

`void`

## Example

```ts
@Component({ ... })
export class VimComponent {
  constructor() {
    injectHotkeySequences([
      { sequence: ['G', 'G'], callback: () => this.goTop() },
      { sequence: ['D', 'D'], callback: () => this.deleteLine() },
    ])
  }
}
```
