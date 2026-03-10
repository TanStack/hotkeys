---
title: Sequences Guide
id: sequences
---

TanStack Hotkeys supports multi-key sequences in Svelte, where keys are pressed one after another rather than simultaneously.

## Global sequences

```svelte
<script lang="ts">
  import { createHotkeySequence } from '@tanstack/svelte-hotkeys'

  createHotkeySequence(['G', 'G'], () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
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

## Sequence options

```ts
createHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,
  enabled: true,
})
```

### Reactive `enabled`

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

## Common Patterns

### Vim-Style Navigation

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

## Under the Hood

`createHotkeySequence` uses the singleton `SequenceManager`. You can also access it directly:

```ts
import {
  createSequenceMatcher,
  getSequenceManager,
} from '@tanstack/svelte-hotkeys'

const manager = getSequenceManager()
const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })
```
