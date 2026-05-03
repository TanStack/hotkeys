---
title: Key State Tracking Guide
id: key-state-tracking
---

TanStack Hotkeys provides `KeyStateTracker` for tracking live keyboard state. The tracker is a singleton re-exported from `@tanstack/ember-hotkeys` that automatically manages `keydown`/`keyup`/`blur` listeners and exposes reactive state via a TanStack Store.

## `KeyStateTracker`

```ts
import { getKeyStateTracker } from '@tanstack/ember-hotkeys';

const tracker = getKeyStateTracker();

tracker.getHeldKeys();    // ['Control', 'Shift']
tracker.isKeyHeld('Shift'); // true
```

## Common Patterns

### Hold-to-Reveal UI

```gts
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { registerDestructor } from '@ember/destroyable';
import { getKeyStateTracker } from '@tanstack/ember-hotkeys';

export default class FileActions extends Component {
  @tracked isShiftHeld = false;

  constructor(owner: unknown, args: Record<string, unknown>) {
    super(owner, args);

    const tracker = getKeyStateTracker();

    const unsubscribe = tracker.store.subscribe(() => {
      this.isShiftHeld = tracker.isKeyHeld('Shift');
    });

    registerDestructor(this, unsubscribe);
  }

  <template>
    {{#if this.isShiftHeld}}
      <button type="button">Permanently Delete</button>
    {{else}}
      <button type="button">Move to Trash</button>
    {{/if}}
  </template>
}
```

### Displaying Held Keys

```gts
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { registerDestructor } from '@ember/destroyable';
import { getKeyStateTracker } from '@tanstack/ember-hotkeys';

export default class KeyDebugger extends Component {
  @tracked heldKeys: Array<string> = [];

  constructor(owner: unknown, args: Record<string, unknown>) {
    super(owner, args);

    const tracker = getKeyStateTracker();

    const unsubscribe = tracker.store.subscribe(() => {
      this.heldKeys = tracker.getHeldKeys();
    });

    registerDestructor(this, unsubscribe);
  }

  <template>
    <div>
      {{#if this.heldKeys.length}}
        Keys: {{this.heldKeys}}
      {{else}}
        No keys held
      {{/if}}
    </div>
  </template>
}
```

## Under the Hood

The `KeyStateTracker` is a singleton that manages its own `keydown`, `keyup`, and `blur` listeners. It uses a TanStack Store for reactive state, so you can subscribe to changes and read current state:

```ts
import { getKeyStateTracker } from '@tanstack/ember-hotkeys';

const tracker = getKeyStateTracker();

// Read current state
tracker.store.state.heldKeys;  // ['Control', 'A']
tracker.store.state.heldCodes; // { Control: 'ControlLeft', A: 'KeyA' }

// Subscribe to changes
const unsubscribe = tracker.store.subscribe(() => {
  console.log('Currently held:', tracker.getHeldKeys());
});
```
