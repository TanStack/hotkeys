---
title: Overview
id: overview
---

TanStack Hotkeys is a type-safe, headless library for keyboard shortcuts, sequences, recording, and key state tracking. Use its framework adapters for registration and cleanup, and build shortcut interfaces with your own components and application state.

## Choose what a shortcut follows

A binding can follow a logical character or a physical keyboard position. Both forms use the same registration APIs:

```ts
// React; the other adapters accept the same binding forms.
useHotkey('Mod+S', save) // Logical S on the active layout
useHotkey('Alt+[KeyW]', moveForward) // Physical KeyW position
useHotkey({ code: 'NumpadAdd', mod: true }, zoomIn)
```

`Mod` means Command on macOS and Control on Windows/Linux. Brackets identify physical `event.code` names in strings, including `[Enter]` and `[F13]`. Object bindings use either `key` or `code`, never both. Both logical names and physical codes have type-safe autocomplete.

Logical bindings prefer `event.key`. ASCII letter output remains authoritative on layouts such as Dvorak and AZERTY; conservative code fallback helps when Option, dead keys, or non-Latin output transforms the character. Physical bindings match `event.code` exactly. Among eligible registrations on a target, exact matches take priority over weaker fallbacks.

Logical and physical bindings both support F1–F24 and shared named keys such as `CapsLock`, `MediaPlayPause`, and `BrowserBack`. Some browser names differ: logical `LaunchApplication1` corresponds to physical `[LaunchApp1]`. Logical `Enter` includes numpad Enter, while `[Enter]` and `[NumpadEnter]` distinguish their positions.

## Register actions and sequences

Single shortcuts and sequence steps use the same binding syntax. For example, `['G', 'G']` follows the logical letter, while `['[KeyG]', '[KeyG]']` follows a position. Sequences may mix logical and physical steps. Modifier-only events, IME composition, and automatic repeats do not advance sequences or extend their timeout.

Registrations support enabled state, element targets, input handling, callback metadata, and conflict policies. Framework adapters update bindings from normal reactive state and remove them on unmount. `meta.name`, `meta.description`, and `meta.group` describe registrations for menus and help panels; they do not change matching or scope.

## Record a replacement binding

Recorders default to `recordBy: 'code'`. On macOS, Option+S producing `ß` records `Alt+[KeyS]`, so replay follows the same physical combination. Set `recordBy: 'key'` to intentionally record the produced logical character. The recorder never silently switches between these modes.

Pass recorded strings directly into registrations and store them in ordinary application state. Both single and sequence recorders support validation, structured rejection, and live-registry conflict checks. Rejected candidates leave recording active. Clearing calls only `onClear`; your app decides whether that removes a binding or restores an initial value.

## Display shortcuts and hints

Use `formatForDisplay` at render time. Both `Mod+S` and `Mod+[KeyS]` display as `⌘ S` on macOS, but their stored identities remain distinct. `parts: true` returns individual keycap labels, and symbols can be configured separately for modifiers and keys.

Physical labels use readable defaults such as `S`, `2`, and numpad labels. For a known layout, pass an already-resolved `layoutMap`; use `keyLabels` for explicit overrides. Formatting stays synchronous and never loads a keyboard layout. Labels do not change registration or recording behavior.

Key-state primitives expose held logical keys and physical codes. `matchesHeldModifiers` and framework hint helpers reveal relevant shortcuts while modifiers are held. Live registration views and devtools expose current shortcuts and sequence progress, making it possible to build grouped help panels without a separate action catalog.

## Inspect a binding

`ParsedHotkey` preserves identity as a union: logical bindings have `key`, physical bindings have `code`. Narrow with `parsed.code !== undefined` before reading it. Shared resolved flags and the ordered modifier list live in `ParsedModifiers`. `parseKeyboardEvent` produces logical identity; code recording constructs physical identity explicitly.

Start with the [React Quick Start](./framework/react/quick-start), [Angular Quick Start](./framework/angular/quick-start), [Vue Quick Start](./framework/vue/quick-start), or [Lit Quick Start](./framework/lit/quick-start). Explore the [Router kitchen sink](./framework/react/examples/kitchen-sink) for route lifetimes, recording, and hints, or the [vanilla formatter playground](./framework/vanilla/examples/formatForDisplay) for display options.
