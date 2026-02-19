---
title: Troubleshooting
id: troubleshooting
---

# Troubleshooting

This page collects the most common reasons hotkeys don’t fire (or fire unexpectedly) and how to fix them.

## My hotkey doesn’t fire while typing in an input/textarea

By default, TanStack Hotkeys **ignores** keyboard events that originate from common text input elements (for example `input`, `textarea`, and contenteditable regions). This prevents hotkeys from breaking normal typing.

**Fix options:**

- Bind the hotkey to a more specific target (for example a focused panel) instead of `document`.
- Use a dedicated UI (like a command palette) that intentionally captures key events.

## My hotkey fires even when focus is inside an input

If a hotkey is firing while the user is typing, it usually means the event is being listened to on a target that’s too broad (or you’re bypassing the default input filtering).

**Fix:**

- Make sure you’re using the default input filtering behavior.
- Prefer scoping hotkeys to a container (panel/dialog) that must be focused.

## The same hotkey fires twice

Common causes:

- In React development (especially with Strict Mode), effects and subscriptions can run more than once, which can expose missing cleanup or double-registration.
- You accidentally registered the same hotkey in multiple components.

**Fix:**

- Ensure hotkeys are registered in exactly one place.
- If you need per-route registration, clean up registrations on unmount.

## Hotkeys behave differently on macOS vs Windows/Linux

Use `Mod` when you mean “Cmd on macOS, Ctrl elsewhere”.

Examples:

- `Mod+K` (Cmd+K on macOS, Ctrl+K on Windows/Linux)
- `Mod+Shift+P`

## My hotkey uses a symbol key and doesn’t match `event.key`

Some keyboard layouts can produce characters where `event.key` isn’t the physical key you expect (for example when using Option/Alt combinations).

**Tip:** Prefer the library helpers that normalize key names and hotkey strings instead of comparing raw `event.key` yourself.

## Still stuck?

If you can share a minimal reproduction, discussions are the fastest way to get help:

- https://github.com/tanstack/hotkeys/discussions
