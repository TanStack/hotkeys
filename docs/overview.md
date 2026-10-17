---
title: Overview
id: overview
description: TanStack Hotkeys is a type-safe keyboard shortcut library for React, Preact, Solid, Angular, Vue, Svelte, Lit, Alpine, Ember, Octane, and vanilla JavaScript.
---

TanStack Hotkeys is a type-safe, framework-agnostic library for keyboard shortcuts. It includes:

- **Hotkey registration** for shortcuts like `Mod+S` and Vim-style sequences like `G G`
- **Display formatting** for platform-appropriate labels like `⌘ S` and `Ctrl+S`
- **Scopes** for turning groups of hotkeys on and off with the part of the page they belong to
- **App hotkeys** for cheat sheets and user-customizable shortcuts
- **Hotkey recording** for shortcut settings screens
- **Key state tracking** for held keys and modifier hints
- **Devtools** for inspecting shortcuts while you develop

> [!IMPORTANT]
> TanStack Hotkeys is currently in **alpha** and its API is still subject to change. Early adopters are encouraged to help us solve edge cases across multiple keyboard layouts, locales, and operating systems.

## Motivation

On the surface, keyboard shortcuts are a simple concept, and you would think that it should just take a couple of lines of code to implement them. And sometimes, it can be that simple. However, there are enough small "gotchas" that can eventually add up to an annoying amount of complexity when you need to consider multiple keyboard layouts, operating systems, custom shortcuts, conflicting hotkey scopes, properly ignoring input elements, and more. Browser keyboard events have their own edge cases too: key repeat, IME composition, and keys that look stuck after a missed key-up or a window switch.

As an app grows, its shortcuts also end up scattered across components. Cheat sheets and settings screens are maintained by hand, drift out of sync with the actual hotkeys, and miss shortcuts on pages that haven't loaded yet.

Surprisingly, in our experience, even AI often struggles to get hotkey management fully correct. We believe that providing a library that brings type-safety and well thought out cross-platform compatibility to hotkey management is a valuable contribution to the community.

## Features

### Hotkey registration

Register shortcuts such as `Mod+S` to save a document or `Escape` to close a dialog. A hotkey registered by a component is active while that component is mounted, so a dialog's `Escape` works only while the dialog is open. Hotkeys can also be enabled conditionally or bound to a specific element. `HotkeyManager` handles event listeners, conflict detection, and input filtering.

By default, TanStack Hotkeys prevents the browser's default action, stops event propagation, and ignores single-key shortcuts while the user types in a text field. [Sensible Defaults](./guides/sensible-defaults) explains each default and how to change it.

### Multi-key sequences

Some shortcuts are a series of keystrokes instead of a single combination. Pass an array of chords anywhere a hotkey is accepted to register a Vim-style sequence such as `['G', 'G']` or `['D', 'I', 'W']`, with a configurable timeout between steps. Use sequences for navigation or commands when you want more shortcuts without adding more modifier keys.

### Type-safe, cross-platform bindings

TypeScript autocomplete helps you write valid shortcut strings such as `Control+A`, `Alt+S`, or `Mod+Shift+G`. You can also use a `RawHotkeyChord` object, such as `{ key: 'S', mod: true }`.

`Mod` resolves to Command on macOS and Control on Windows and Linux, so the same binding works across operating systems. Logical shortcuts follow the character that was pressed, while physical shortcuts follow a keyboard position. This lets you choose between a letter-based command and a position-based control, such as movement in a game.

### Display formatting

Format chords and sequences for menus, buttons, and cheat sheets with platform-appropriate labels, such as `⌘ S` on macOS and `Ctrl+S` on Windows. You can display a shortcut as text or individual keycaps while keeping its stored hotkey separate from its label.

### Scopes

Larger apps reuse keys. `Escape` should close the dialog, not the panel behind it. Give part of your app a scope, and its hotkeys turn on and off with that part of the page. Nested scopes take precedence over the scopes around them, and an exclusive scope, such as a dialog's, suspends every other scope while it is open.

### App hotkeys

Hotkeys registered by components only exist while those components are mounted. Declare every hotkey up front with `defineAppHotkeys` and pass the declarations to your framework's provider to list them in cheat sheets and settings screens, even on routes that have not loaded. Users can rebind or unbind any of them, conflicts are checked across every declaration, and your app decides where to save their custom hotkeys.

### Hotkey recording

`HotkeyRecorder` captures a key combination so users can customize shortcuts in a settings UI. Set `maxSteps: Infinity` to let users record a sequence too. It supports validation and conflict checks before you save a hotkey. You can register the recorded hotkey directly, store it in your application's state, or save it as an app hotkey's custom hotkey.

### Key state tracking

`KeyStateTracker` tracks held keys and modifiers. Framework APIs such as `useHeldKeys`, `useHeldKeyCodes`, and `useKeyHold` let you respond while a key is down. Use them for keyboard controls, visual feedback, or hints that appear while a modifier is held.

### Framework adapters

Use React and Preact hooks, Solid primitives, Angular inject APIs, Vue composables, Lit controllers and decorators, Svelte reactive APIs, Alpine scopes, Ember helpers, or Octane hooks. The adapters connect hotkey registration and key state to your framework and clean up registrations when components unmount. You can also use the core utilities directly in vanilla JavaScript.

### Devtools

See registered hotkeys, scopes, declared app hotkeys, held keys, and sequence progress in real time. The [devtools](./devtools) help you inspect which shortcuts are active and how they are configured while developing your application.

## Where to start

Most apps only need to register hotkeys and show them in the UI. Start with the quick start for [React](framework/react/quick-start), [Preact](framework/preact/quick-start), [Solid](framework/solid/quick-start), [Angular](framework/angular/quick-start), [Vue](framework/vue/quick-start), [Svelte](framework/svelte/quick-start), [Lit](framework/lit/quick-start), [Alpine](framework/alpine/quick-start), [Ember](framework/ember/quick-start), or [Octane](framework/octane/quick-start).

Add the other pieces when your app needs them:

- **Scopes**, when groups of hotkeys turn on and off together, such as everything in a dialog or a pane.
- **App hotkeys**, when you want a cheat sheet that lists every shortcut, or want users to change them.
- **Recording**, when users should be able to press the shortcut they want in a settings screen.
