---
title: Quick Start
id: quick-start
---

## Installation

Don't have TanStack Hotkeys installed yet? See the [Installation](../../installation) page for instructions.

## Your First Hotkey

The `{{on-hotkey}}` helper is the primary way to register keyboard shortcuts in Ember:

```gts
import onHotkey from '@tanstack/ember-hotkeys/helpers/on-hotkey';

const save = () => {
  saveDocument();
};

<template>
  {{onHotkey "Mod+S" save}}
  <div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>
</template>
```

The `Mod` modifier automatically resolves to `Meta` (Command) on macOS and `Control` on Windows/Linux, so your shortcuts work across platforms without extra logic.

## Common Patterns

### Multiple Hotkeys

```gts
import onHotkey from '@tanstack/ember-hotkeys/helpers/on-hotkey';

<template>
  {{onHotkey "Mod+S" @onSave}}
  {{onHotkey "Mod+Z" @onUndo}}
  {{onHotkey "Mod+Shift+Z" @onRedo}}
  {{onHotkey "Mod+F" @onSearch}}
  {{onHotkey "Escape" @onDismiss}}
</template>
```

### Conditional Hotkeys

Enable or disable hotkeys based on application state via the `enabled` option:

```gts
import onHotkey from '@tanstack/ember-hotkeys/helpers/on-hotkey';

<template>
  {{onHotkey "Escape" @onClose enabled=@isOpen}}
</template>
```

### Multi-Key Sequences

Register Vim-style key sequences with the `{{on-hotkey-sequence}}` helper:

```gts
import onHotkeySequence from '@tanstack/ember-hotkeys/helpers/on-hotkey-sequence';
import { array } from '@ember/helper';

<template>
  {{onHotkeySequence (array "G" "G") @onScrollToTop}}
  {{onHotkeySequence (array "G" "Shift+G") @onScrollToBottom}}
</template>
```

### Displaying Hotkeys in the UI

Format hotkeys for platform-aware display:

```gts
import { formatForDisplay } from '@tanstack/ember-hotkeys';
import onHotkey from '@tanstack/ember-hotkeys/helpers/on-hotkey';

<template>
  {{onHotkey "Mod+S" @onSave}}
  <button type="button">
    Save <kbd>{{formatForDisplay "Mod+S"}}</kbd>
  </button>
</template>
```

## Test Helpers

The package ships with test utilities for writing integration tests:

```ts
import { triggerKeyPress, triggerKeyRelease } from '@tanstack/ember-hotkeys/test-support';

test('it saves on Mod+S', async function (assert) {
  assert.expect(1);

  const onSave = () => assert.ok(true, 'save was called');

  await render(
    <template>
      {{onHotkey "Mod+S" onSave}}
    </template>,
  );

  triggerKeyPress('Mod+S');
});
```

## Next Steps

- [Hotkeys Guide](./guides/hotkeys)
- [Sequences Guide](./guides/sequences)
