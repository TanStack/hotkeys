---
'@tanstack/svelte-hotkeys': patch
'@tanstack/svelte-hotkeys-devtools': patch
---

Relative imports in the published files now end in `.js`, so the types resolve with `moduleResolution: "nodenext"`. The devtools types also declare `Component<Props>` instead of `Component<Props, {}, string>`, which current Svelte types reject with `skipLibCheck: false`.
