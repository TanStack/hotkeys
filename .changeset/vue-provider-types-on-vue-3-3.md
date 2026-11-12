---
'@tanstack/vue-hotkeys': patch
---

`HotkeysProvider` is now typed on every supported Vue version. Its published type listed 20 type arguments for Vue's `DefineComponent`, which only Vue 3.5.2 and later accept. On Vue 3.3.0 to 3.5.1, type checking failed with `TS2707`, or with `skipLibCheck` the provider became `any` and wrong props passed unchecked. Props, events, and slots are typed as before on Vue 3.5.2 and later.
