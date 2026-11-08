---
'@tanstack/hotkeys': patch
'@tanstack/react-hotkeys': patch
'@tanstack/preact-hotkeys': patch
'@tanstack/vue-hotkeys': patch
'@tanstack/solid-hotkeys': patch
'@tanstack/angular-hotkeys': patch
'@tanstack/octane-hotkeys': patch
'@tanstack/lit-hotkeys': patch
'@tanstack/alpine-hotkeys': patch
'@tanstack/ember-hotkeys': patch
---

A hotkey whose element target isn't there yet now waits for it in every adapter. Before, a target of `undefined` listened on `document`, so the hotkey fired anywhere on the page until its element mounted. `undefined` is what an unset element usually is: a `useRef()` in React or Preact, a `ref()` in Vue, `createSignal<HTMLElement>()` in Solid, or a `viewChild()` value read in an Angular options function. Now a `target` that is `null` or `undefined`, or a ref that is still unset, registers nothing until the element exists. Only an omitted `target` listens on `document`.

This changes one case: a wrapper that forwards an optional target, such as `{ target: props.target }`, used to listen on `document` while the prop was unset and now waits. Pass `target: document` to listen on the document explicitly.

Vue: a template ref on a component, such as `useTemplateRef<InstanceType<typeof Panel>>('panel')`, now works as a `target` and listens on the component's root element. Before, it threw `target.addEventListener is not a function`. A component without a single root element registers nothing.

Octane: `useHotkey` and `useHotkeys` now accept a ref object, such as `useRef<HTMLDivElement | null>(null)`, as `target`, like the React adapter. The hook reads `current` after each render.
