---
'@tanstack/hotkeys': patch
---

Development warnings now print in apps built with a bundler. Vite, webpack and others replace `process.env.NODE_ENV` and give the browser no `process` global, and the library checked for that global first. In those apps the browser console never showed a duplicate registration, an unknown key name such as `escape`, a repeated exclusive scope, or `checkHotkey` output. Production builds still drop the warning code. A page that loads the library with no bundler still logs nothing, and no longer throws when `process` exists without `env`.
