# Angular hotkeys kitchen sink

Run `pnpm dev` here after installing and building the workspace packages from the repository root.

This example uses simple hash routes. Each route mounts a framework component and removes its registrations when it unmounts. Navigation shortcuts stay registered in the layout.

- Tickets: shared button/shortcut callbacks, enabled state, input filtering, modifier-held hints.
- Editor: scoped targets, repeat handling, propagation, and keyup events.
- Sequences: single and bulk sequences, timeout, and live progress.
- Recording: physical/logical recording, conflicts, validation, rejection, clearing, cancellation, sequence commits, and local rebinding.
- Formatting: platform labels, independent symbol options, and keycap parts.

Open the shortcuts panel to inspect live registrations and metadata groups. Hold Alt / Option to reveal relevant hints. Recorded bindings live in route state; leaving the recording route restores its initial bindings.

`Alt+[KeyS]` matches a physical code; `Alt+S` matches a logical key with layout fallbacks. Formatting shortens physical prefixes without changing the binding. Applications can supply `layoutMap` or `keyLabels` for layout-specific labels. Browser/OS shortcuts may intercept events before the page receives them.
