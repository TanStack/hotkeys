---
'@tanstack/hotkeys': minor
'@tanstack/react-hotkeys': minor
'@tanstack/preact-hotkeys': minor
'@tanstack/solid-hotkeys': minor
'@tanstack/vue-hotkeys': minor
'@tanstack/svelte-hotkeys': minor
'@tanstack/angular-hotkeys': minor
'@tanstack/lit-hotkeys': minor
'@tanstack/alpine-hotkeys': minor
'@tanstack/ember-hotkeys': minor
'@tanstack/octane-hotkeys': minor
---

Escape goes to the innermost open overlay, not only to native dialogs and popovers. While focus is inside an element with `role="dialog"`, `role="alertdialog"`, or `role="menu"`, or on an expanded combobox or popup button (`aria-expanded="true"`, with `aria-haspopup` on the button), hotkeys outside it skip Escape. They don't run, call `preventDefault()`, or stop propagation, so the overlay closes. This changes what one Escape press does:

- Dialogs that stayed open now close, and the page hotkey doesn't run: Reka UI (shadcn-vue, Nuxt UI), Headless UI, Vuetify, Bits UI (shadcn-svelte), Kobalte (solid-ui, shadcn-solid), Corvu, and Shoelace.
- Dialogs that closed and also ran the page hotkey now only close: Radix UI (shadcn/ui), PrimeVue, and the Angular CDK and Angular Material. The first Escape in an open React Aria `ComboBox` closes its list without running the page hotkey.
- A hotkey targeted inside the overlay keeps Escape. Inside a `role="dialog"` or `role="alertdialog"` element, any hotkey in a named scope keeps it too, whatever its target, so a dialog that registers its own `Escape` hotkey in its scope still closes itself. An open combobox or menu inside that dialog still closes first. A global `Escape` hotkey that closes an app's own `role="dialog"` element now skips it. Give that hotkey the dialog's scope or target the dialog.
- Native dialogs follow `closedby`: a modal dialog with `closedby="none"` no longer takes Escape from hotkeys, and a non-modal dialog with `closedby="any"` or `closedby="closerequest"` gets it.

The overlays are read once per key press, from a `window` capture listener, before listeners on the document and its elements can close one.
