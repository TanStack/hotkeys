---
'@tanstack/lit-hotkeys': patch
'@tanstack/hotkeys': patch
---

Lit controllers no longer register hotkeys or subscribe to stores during server rendering when `@lit-labs/ssr`'s global DOM shim is loaded. Before, with the `connectedCallback: true` render option, every server render left its hotkey registrations behind, and reading held keys threw. The core key state tracker now sets up no listeners where a `document` exists without a `window`.
