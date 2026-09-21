---
title: Sequences Guide
id: sequences
---

TanStack Hotkeys supports multi-key sequences in Svelte, where keys are pressed one after another rather than simultaneously.

Sequence steps use the same string syntax as single hotkeys. For example, `['[KeyG]', '[KeyG]']` follows a physical position, while `['G', 'G']` follows the logical letter. A sequence can mix forms, such as `['Mod+[KeyK]', 'C']`. Display steps with `sequence.map((step) => formatForDisplay(step)).join(' → ')`.

## Global sequences

```svelte
<script lang="ts">
  import { createHotkeySequence } from '@tanstack/svelte-hotkeys'

  createHotkeySequence(['G', 'G'], () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
</script>
```

## Many sequences at once

Use `createHotkeySequences` to register several global sequences in one place (including from a reactive getter). For multiple sequences on a focused element, use `createHotkeySequencesAttachment` the same way you would use `createHotkeySequenceAttachment`.

```svelte
<script lang="ts">
  import { createHotkeySequences } from '@tanstack/svelte-hotkeys'

  createHotkeySequences([
    { sequence: ['G', 'G'], callback: () => scrollToTop() },
    { sequence: ['D', 'D'], callback: () => deleteLine(), options: { timeout: 500 } },
  ])
</script>
```

## Scoped sequences

Use `createHotkeySequenceAttachment` when a sequence should only be active while a specific element owns focus.

```svelte
<script lang="ts">
  import { createHotkeySequenceAttachment } from '@tanstack/svelte-hotkeys'

  const editorSequences = createHotkeySequenceAttachment(['G', 'G'], () => {
    scrollToTop()
  })
</script>

<div tabindex="0" {@attach editorSequences}>
  Focus here, then press g then g
</div>
```

## Matching steps

Both `SequenceManager` and `createSequenceMatcher` ignore modifier-only events, IME composition, and automatic keydown repeats. These events neither advance the sequence nor refresh its timeout: holding G does not complete a two-press G sequence. The manager prefers exact matches over weaker logical-key fallbacks while preserving equally strong matches.

## Sequence options

```ts
createHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,
  enabled: true,
})
```

### Reactive `enabled`

When disabled, the sequence stays registered (visible in devtools); only execution is suppressed.

```svelte
<script lang="ts">
  import { createHotkeySequence } from '@tanstack/svelte-hotkeys'

  let isVimMode = $state(true)

  createHotkeySequence(
    ['G', 'G'],
    () => scrollToTop(),
    () => ({ enabled: isVimMode }),
  )
</script>
```

## Default options

```svelte
<script lang="ts">
  import { setHotkeysContext } from '@tanstack/svelte-hotkeys'

  setHotkeysContext({
    hotkeySequence: { timeout: 1500 },
  })
</script>
```

### `meta`

Sequences support the same `meta` option as hotkeys, so you can attach a `name` and `description` for use in shortcut palettes and devtools.

```ts
createHotkeySequence(['G', 'G'], () => scrollToTop(), {
  meta: { name: 'Go to Top', description: 'Scroll to the top of the page' },
})
```

See the [Hotkeys Guide](./hotkeys.md#metadata-name--description) for details on declaration merging and introspecting registrations.

## Chained modifier chords

This example follows physical R and T positions. Brackets retain those positions even when the keys produce different letters. Other sequences can continue using logical characters.

You can use the same modifier on consecutive steps (for example `Shift+R` then `Shift+T`):

```ts
createHotkeySequence(['Shift+[KeyR]', 'Shift+[KeyT]'], () => doNextAction())
```

While a sequence is in progress, modifier-only keydown events (Shift, Control, Alt, or Meta pressed alone) are ignored: they do not advance the sequence and do not reset progress.

## Common patterns

### Vim-style navigation

```ts
createHotkeySequence(['G', 'G'], () => scrollToTop())
createHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
createHotkeySequence(['D', 'D'], () => deleteLine())
createHotkeySequence(['D', 'W'], () => deleteWord())
createHotkeySequence(['C', 'I', 'W'], () => changeInnerWord())
```

### Konami Code

```ts
createHotkeySequence(
  ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'B', 'A'],
  () => enableEasterEgg(),
  { timeout: 2000 },
)
```

## Under the hood

`createHotkeySequence` uses the singleton `SequenceManager`. You can also access it directly:

```ts
import {
  createSequenceMatcher,
  getSequenceManager,
} from '@tanstack/svelte-hotkeys'

const manager = getSequenceManager()
const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })
```

### Conflicting registrations

For the same target, duplicate detection compares resolved steps: modifier aliases, modifier order, and logical key casing do not create separate bindings. `conflictBehavior` applies to equivalent sequences without rewriting their stored strings. Physical and logical identities remain distinct, and a shared prefix alone is not a duplicate registration. Recorder conflict detection also checks prefixes and observed physical/logical overlap.
