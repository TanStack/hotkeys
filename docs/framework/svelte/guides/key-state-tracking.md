---
title: Key State Tracking Guide
id: key-state-tracking
---

TanStack Hotkeys provides three Svelte functions for tracking live keyboard state: `getHeldKeys`, `getHeldKeyCodesMap`, and `getIsKeyHeld`.

## `getHeldKeys`

```svelte
<script lang="ts">
  import { getHeldKeys } from '@tanstack/svelte-hotkeys'

  const heldKeys = getHeldKeys()
</script>

<div>{heldKeys.keys.length > 0 ? heldKeys.keys.join(' + ') : 'No keys held'}</div>
```

## `getHeldKeyCodesMap`

```svelte
<script lang="ts">
  import { getHeldKeyCodesMap } from '@tanstack/svelte-hotkeys'

  const heldCodes = getHeldKeyCodesMap()
</script>

<pre>{JSON.stringify(heldCodes.codes, null, 2)}</pre>
```

## `getIsKeyHeld`

```svelte
<script lang="ts">
  import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  const isShiftHeld = getIsKeyHeld('Shift')
</script>

<span class:active={isShiftHeld.held}>Shift</span>
```

## Common patterns

### Hold-to-reveal UI

```svelte
<script lang="ts">
  import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  const isShiftHeld = getIsKeyHeld('Shift')
</script>

{#if isShiftHeld.held}
  <button>Permanently Delete</button>
{:else}
  <button>Move to Trash</button>
{/if}
```

### Debugging key display

```svelte
<script lang="ts">
  import {
    formatForDisplay,
    getHeldKeyCodesMap,
    getHeldKeys,
    type RegisterableHotkey,
  } from '@tanstack/svelte-hotkeys'

  const heldKeys = getHeldKeys()
  const heldCodes = getHeldKeyCodesMap()
</script>

<div>
  {#each heldKeys.keys as key}
    <kbd>
      {formatForDisplay(key as RegisterableHotkey, { useSymbols: true })}:
      {heldCodes.codes[key] ?? 'unknown'}
    </kbd>
  {/each}
</div>
```

## Under the hood

All three functions subscribe to the singleton `KeyStateTracker`:

```ts
import { getKeyStateTracker } from '@tanstack/svelte-hotkeys'

const tracker = getKeyStateTracker()
tracker.getHeldKeys()
tracker.isKeyHeld('Shift')
```

## Modifier-held shortcut hints

`getHotkeyHint` answers whether held modifiers are relevant to a binding. Keep formatting and badge styling in your component:

```ts
const hint = getHotkeyHint(() => binding) // reactive getter: hint.visible
```

For `Alt+Shift+[KeyK]`, holding Alt, Shift, or both reveals the hint. An extra Control hides it; releasing all modifiers or blurring the window hides it. Nonmodifier keys are ignored. AltGraph does not reveal hints. Pass `{ exact: true }` to require all binding modifiers, or `{ platform: 'mac' }` to resolve Mod explicitly. Supply the same platform used by the registration when overriding detection.

Combine the boolean with the action's enabled state. The helper does not register a shortcut or determine whether its target is focused. The core equivalent is `matchesHeldModifiers(binding, heldKeys, options)`.
