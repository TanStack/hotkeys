---
title: Sequences Guide
id: sequences
---

TanStack Hotkeys supports multi-key sequences in Ember, where keys are pressed one after another rather than simultaneously.

## Basic Usage

```gts
import onHotkeySequence from '@tanstack/ember-hotkeys/helpers/on-hotkey-sequence';
import { array } from '@ember/helper';

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

<template>
  {{onHotkeySequence (array "G" "G") scrollToTop}}
</template>
```

## Sequence Options

Options are passed as named arguments, just like `{{on-hotkey}}`:

```gts
{{onHotkeySequence (array "G" "G") @onScrollToTop timeout=1000 enabled=true}}
```

### `timeout`

The maximum time (in milliseconds) between key presses in a sequence. Defaults to 1000ms.

```gts
{{onHotkeySequence (array "D" "I" "W") @onDeleteWord timeout=500}}
```

### Reactive `enabled`

When disabled, the sequence **stays registered** (visible in devtools); only execution is suppressed.

```gts
{{onHotkeySequence (array "G" "G") @onScrollToTop enabled=@isVimMode}}
```

### `meta`

Sequences support the same `meta` option as hotkeys, allowing you to attach a `name` and `description` for use in shortcut palettes and devtools.

```gts
{{onHotkeySequence (array "G" "G") @onScrollToTop
  meta=(hash name="Go to Top" description="Scroll to the top of the page")
}}
```

See the [Hotkeys Guide](./hotkeys#metadata-name--description) for more details on metadata.

## Chained Modifier Chords

You can use modifiers within sequence steps:

```gts
{{onHotkeySequence (array "Shift+R" "Shift+T") @onAction}}
```

While a sequence is in progress, **modifier-only** keydown events (Shift, Control, Alt, or Meta pressed alone) are ignored: they do not advance the sequence and do not reset progress.

## Common Patterns

### Vim-Style Navigation

```gts
import onHotkeySequence from '@tanstack/ember-hotkeys/helpers/on-hotkey-sequence';
import { array } from '@ember/helper';

<template>
  {{onHotkeySequence (array "G" "G") @onScrollToTop}}
  {{onHotkeySequence (array "G" "Shift+G") @onScrollToBottom}}
  {{onHotkeySequence (array "D" "D") @onDeleteLine}}
  {{onHotkeySequence (array "D" "W") @onDeleteWord}}
  {{onHotkeySequence (array "C" "I" "W") @onChangeInnerWord}}
</template>
```

### Konami Code

```gts
{{onHotkeySequence
  (array "ArrowUp" "ArrowUp" "ArrowDown" "ArrowDown" "B" "A")
  @onEasterEgg
  timeout=2000
}}
```

## Under the Hood

`{{on-hotkey-sequence}}` uses the singleton `SequenceManager`. You can also access it directly:

```ts
import { createSequenceMatcher, getSequenceManager } from '@tanstack/ember-hotkeys';

const manager = getSequenceManager();
const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 });
```
