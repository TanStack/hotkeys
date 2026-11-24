---
title: App Hotkeys and Custom Shortcuts in Angular
id: app-hotkeys
description: Declare every hotkey in your Angular app in one place, list them in cheat sheets, and let users change them and save their choices.
---

App hotkeys are optional. Plain `injectHotkey` calls are enough until you need an app-wide cheat sheet or a shortcut settings screen. Because `injectHotkey` registers shortcuts only while its component exists, a cheat sheet built purely from active registrations misses shortcuts on routes that haven't rendered and has no single store to edit them.

App hotkeys solve both. Declare every shortcut's ID, default binding, and metadata once with `defineAppHotkeys`, pass it to `provideHotkeys`, and attach callbacks where the actions live.

## Declare app hotkeys

Create a dedicated module for declarations without importing components or handlers, since this file loads with your app shell:

```ts
// app-hotkeys.ts
import { defineAppHotkeys } from '@tanstack/angular-hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save', group: 'Document' } },
  'doc.find': {
    hotkey: 'Mod+F',
    meta: { name: 'Find', group: 'Document' },
    scope: 'editor',
  },
  'nav.home': {
    hotkey: ['G', 'H'],
    meta: { name: 'Go home', group: 'Navigation' },
    options: { timeout: 800 },
  },
  'palette.open': { hotkey: null, meta: { name: 'Command palette' } },
})

declare module '@tanstack/angular-hotkeys' {
  interface Register {
    appHotkeys: typeof appHotkeys
  }
}
```

- **IDs are your storage contract.** Keep object keys (`'doc.save'`) stable because persisted user overrides key off them.
- **Defaults (`hotkey`).** Pass a chord, a sequence, or `null` for an unassigned action that registers nothing until the user sets one.
- **Options (`options`).** Accepts hotkey behavior options (`capture`, `conflictBehavior`, `eventType`, `ignoreInputs`, `preventDefault`, `stopPropagation`, plus `requireReset` for chords or `timeout` for sequences). See [Hotkey options](./hotkeys#hotkey-options). Options mismatched to the default's kind are type errors. Pass `target` and `enabled` at registration time instead.
- **Scopes (`scope`).** Overrides the [scope](./provide-hotkeys-and-scopes) of whichever provider the hotkey registers under. Declarations in different scopes can share keys.

The `Register` module augmentation enables autocomplete and type checking for `injectAppHotkeys()`, `injectCustomHotkeys()`, and `CustomHotkeys`.

## Provide app hotkeys

Pass the declarations to `provideHotkeys` in your application config. See [Provide app hotkeys](./provide-hotkeys-and-scopes#provide-app-hotkeys):

```ts
import { provideHotkeys } from '@tanstack/angular-hotkeys'
import { appHotkeys } from './app-hotkeys'

bootstrapApplication(AppComponent, {
  providers: [provideHotkeys({ appHotkeys })],
})
```

## Register app hotkeys

Pass an app hotkey from `injectAppHotkeys()` (a signal), or from a direct import of `appHotkeys`, anywhere `injectHotkey` accepts a hotkey:

```ts
import { Component, signal } from '@angular/core'
import { injectAppHotkeys, injectHotkey } from '@tanstack/angular-hotkeys'

@Component({ selector: 'app-editor', template: `...` })
export class EditorComponent {
  readonly appHotkeys = injectAppHotkeys()
  readonly isDirty = signal(false)

  constructor() {
    injectHotkey(() => this.appHotkeys()['doc.save'], () => this.save(), () => ({
      enabled: this.isDirty(),
    }))
  }
}
```

Both forms resolve to the user's current custom binding inside the provider, such as `injectHotkey(appHotkeys['doc.save'], save)`, and fall back to the declared default when there's no provider. When a user rebinds an app hotkey, active registrations update immediately, even when switching between a chord and a sequence.

- **Option merging.** Options merge in order from provider `defaultOptions`, then declared `options`, then call-site options. Call-site options are typed against the declared default's kind, so `timeout` is accepted for `nav.home` but not for `doc.save`.
- **Metadata.** `meta` always comes from the declaration so cheat sheets and handlers stay in sync.

Mix app hotkeys and regular hotkeys freely in `injectHotkeys`:

```ts
injectHotkeys(() => [
  { hotkey: this.appHotkeys()['doc.save'], callback: () => this.save() },
  { hotkey: this.appHotkeys()['nav.home'], callback: () => this.goHome() },
  { hotkey: 'Escape', callback: () => this.close() },
])
```

## List app hotkeys

`injectAppHotkeyList` returns every declared app hotkey, even on routes that haven't rendered, along with its live registration status and `isCustom` flag. See [List every app hotkey](./cheat-sheet-ui-helpers#list-every-app-hotkey).

## Customize and persist hotkeys

TanStack Hotkeys leaves storage up to your app. Pass saved overrides into `customHotkeys` and save updates when they change:

```ts
import { provideHotkeys } from '@tanstack/angular-hotkeys'

bootstrapApplication(AppComponent, {
  providers: [
    provideHotkeys({
      appHotkeys,
      customHotkeys: JSON.parse(localStorage.getItem('hotkeys') ?? '{}'),
      onCustomHotkeysChange: (custom) =>
        localStorage.setItem('hotkeys', JSON.stringify(custom)),
    }),
  ],
})
```

- **Stores diffs only.** `customHotkeys` contains only entries that differ from your defaults, with `null` meaning explicitly unbound. Users who haven't customized a binding automatically receive updated defaults when your app changes them.
- **Persisting updates.** `onCustomHotkeysChange` fires with the full `CustomHotkeys` map whenever the user updates or resets a binding.

Pass `customHotkeys` as a signal or function when saved data loads later.

How incoming `customHotkeys` updates behave:

- **Changed values.** Replaces current overrides without firing `onCustomHotkeysChange`, for example when async settings finish loading or the user switches accounts.
- **Deeply equal data on re-render.** Ignored, keeping in-memory edits intact even if you re-parse `localStorage` each time.
- **`undefined`.** Leaves current overrides unchanged while async settings are still loading.
- **`null`.** Clears all overrides, which is useful on sign-out.
- **Unknown IDs or invalid bindings.** Silently ignored so older saved data doesn't break after app updates.

Because the [hotkey recorder](./custom-hotkey-recording) emits `Mod` rather than OS-specific `Meta` or `Control`, shortcuts saved on macOS carry over to Windows and Linux.

### Change hotkeys

Use `injectCustomHotkeys` alongside the hotkey recorder to build a shortcut settings row. See [Hotkey Recording](./custom-hotkey-recording):

```ts
import { Component, computed, input } from '@angular/core'
import {
  injectAppHotkeys,
  injectCustomHotkeys,
  injectFormatForDisplay,
  injectHotkeyRecorder,
} from '@tanstack/angular-hotkeys'
import type { AppHotkeyId } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-shortcut-row',
  template: `
    {{ appHotkey().meta?.name }}:
    {{ appHotkey().hotkey ? formatForDisplay(appHotkey().hotkey!) : 'Unassigned' }}
    <button (click)="recorder.startRecording()">Change</button>
    <button (click)="custom.resetCustomHotkey(id())">Reset</button>
  `,
})
export class ShortcutRowComponent {
  readonly id = input.required<AppHotkeyId>()
  readonly appHotkeys = injectAppHotkeys()
  readonly appHotkey = computed(() => this.appHotkeys()[this.id()])
  readonly custom = injectCustomHotkeys()
  readonly formatForDisplay = injectFormatForDisplay()

  readonly recorder = injectHotkeyRecorder(() => ({
    maxSteps: Infinity,
    validate: (hotkey, context) => {
      const conflicts = this.custom.findConflicts(this.id(), hotkey, context)
      return conflicts.length === 0 || `Used by ${conflicts[0]?.meta?.name}`
    },
    onRecord: (hotkey, context) => this.custom.setCustomHotkey(this.id(), hotkey, context),
    onClear: () => this.custom.setCustomHotkey(this.id(), null),
  }))
}
```

Pass the recorder's `context` into `findConflicts` and `setCustomHotkey` so conflict detection compares the physical key presses too. That catches differently spelled bindings that fire for the same press, such as a recorded `Shift+[Slash]` against a declared `?` on US keyboards.

| Member | Description |
| --- | --- |
| `customHotkeys()` | Current overrides that differ from the declared defaults |
| `setCustomHotkey(id, hotkey, context?)` | Assigns a hotkey, or unbinds with `null`. Returns any conflicting app hotkeys and changes nothing if there are any. |
| `findConflicts(id, hotkey, context?)` | Returns app hotkeys that collide with assigning `hotkey` to `id` |
| `resetCustomHotkey(id)` | Restores one app hotkey to its default |
| `resetCustomHotkeys()` | Restores all app hotkeys to their defaults |

Two app hotkeys conflict when their scopes overlap (matching scopes, or either is in `'global'` or has no declared scope) and their bindings collide (equal chords, or one sequence starting with the other chord or sequence). Conflict checks scan every declaration, mounted or not.

Each app hotkey exposes `defaultHotkey`, and `injectAppHotkeyList` includes `isCustom` to highlight modified rows. `provideHotkeys` creates an `AppHotkeysStore` from the core package. For imperative use, see the [`AppHotkeysStore` reference](../../../reference/classes/AppHotkeysStore.md).

See the [Kitchen Sink example](../examples/kitchen-sink) for app hotkeys, grouped cheat sheets, and customization wired together.
