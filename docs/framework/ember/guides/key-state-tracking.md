---
title: Key State Tracking Guide
id: key-state-tracking
---

TanStack Hotkeys provides `KeyStateTracker` for tracking live keyboard state. The tracker is re-exported from `@tanstack/ember-hotkeys` and can be used directly in Ember components.

## `KeyStateTracker`

```ts
import { getKeyStateTracker } from '@tanstack/ember-hotkeys';

const tracker = getKeyStateTracker();
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

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') this.isShiftHeld = true;
    };
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') this.isShiftHeld = false;
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    registerDestructor(this, () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    });
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

export default class KeyDebugger extends Component {
  @tracked heldKeys: Array<string> = [];

  constructor(owner: unknown, args: Record<string, unknown>) {
    super(owner, args);

    const onKeyDown = (event: KeyboardEvent) => {
      if (!this.heldKeys.includes(event.key)) {
        this.heldKeys = [...this.heldKeys, event.key];
      }
    };
    const onKeyUp = (event: KeyboardEvent) => {
      this.heldKeys = this.heldKeys.filter((k) => k !== event.key);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    registerDestructor(this, () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    });
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

The `KeyStateTracker` is a singleton that listens for `keydown` and `keyup` events on the document. It provides `heldKeys` and `heldKeyCodes` state that updates in real-time:

```ts
import { getKeyStateTracker } from '@tanstack/ember-hotkeys';

const tracker = getKeyStateTracker();
// tracker.heldKeys — current set of held event.key values
// tracker.heldKeyCodes — current set of held event.code values
```
