---
title: Hotkeys Guide
id: hotkeys
---

The `{{on-hotkey}}` helper is the primary way to register keyboard shortcuts in Ember applications. It wraps the singleton `HotkeyManager` with Ember's helper lifecycle: when the helper enters the template the key is registered, and when the template is torn down the listener is removed.

## Basic Usage

```gts
import onHotkey from '@tanstack/ember-hotkeys/helpers/on-hotkey';

const save = () => {
  saveDocument();
};

<template>
  {{onHotkey "Mod+S" save}}
</template>
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```gts
import onHotkey from '@tanstack/ember-hotkeys/helpers/on-hotkey';

const save = (event: KeyboardEvent, context: HotkeyCallbackContext) => {
  console.log(context.hotkey);
  console.log(context.parsedHotkey);
};

<template>
  {{onHotkey "Mod+S" save}}
</template>
```

## Options

All options are passed as named arguments in the template:

```gts
{{onHotkey "Mod+S" @onSave
  preventDefault=true
  stopPropagation=true
  eventType="keydown"
  enabled=true
}}
```

### `enabled`

When `enabled` is false, the hotkey **stays registered** (visible in devtools); only the callback is suppressed.

```gts
import onHotkey from '@tanstack/ember-hotkeys/helpers/on-hotkey';

<template>
  {{onHotkey "Escape" @onClose enabled=@isOpen}}
</template>
```

### `target`

Scope a hotkey to a specific DOM element instead of the entire document:

```gts
import onHotkey from '@tanstack/ember-hotkeys/helpers/on-hotkey';

<template>
  <div tabindex="0" {{onHotkey "Escape" @onClosePanel target=this}}>
    Panel content
  </div>
</template>
```

### `preventDefault`

Prevent the browser default action (e.g., browser save dialog for `Mod+S`). This is `true` by default.

```gts
{{onHotkey "Mod+S" @onSave preventDefault=true}}
```

### `stopPropagation`

Stop the event from propagating to parent elements:

```gts
{{onHotkey "Escape" @onClose stopPropagation=true}}
```

### `eventType`

Listen for `keyup` events instead of the default `keydown`:

```gts
{{onHotkey "Escape" @onClose eventType="keyup"}}
```

### `requireReset`

When `true`, the hotkey fires at most once per key-hold. The user must release the key and press again to fire the callback a second time.

```gts
{{onHotkey "Escape" @onClose requireReset=true}}
```

### `ignoreInputs`

By default, hotkeys are suppressed when an input element is focused. Set `ignoreInputs` to `false` to fire the callback even when an input, textarea, or contenteditable element has focus:

```gts
{{onHotkey "Enter" @onSubmit ignoreInputs=false}}
```

### `conflictBehavior`

Control what happens when the same hotkey is registered twice:

```gts
{{onHotkey "Mod+S" @onSave conflictBehavior="replace"}}
```

### `platform`

Force a specific platform for `Mod` resolution:

```gts
{{onHotkey "Mod+S" @onSave platform="mac"}}
```

## Metadata (name & description)

Every hotkey registration can carry a `meta` object with a `name` and `description`. This metadata is informational only -- it does not affect hotkey behavior -- but it flows through to registrations and devtools, making it easy to build shortcut palettes and help screens.

```gts
{{onHotkey "Mod+S" @onSave meta=(hash name="Save" description="Save the document")}}
```

## Automatic Cleanup

Registrations are cleaned up automatically when the helper is destroyed -- for example, when the component is removed from the DOM or when an `{{#if}}` block becomes falsy.

## The Hotkey Manager

You can access the underlying manager directly when needed:

```ts
import { getHotkeyManager } from '@tanstack/ember-hotkeys';

const manager = getHotkeyManager();
manager.isRegistered('Mod+S');
manager.getRegistrationCount();
```
