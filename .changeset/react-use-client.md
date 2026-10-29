---
'@tanstack/react-hotkeys': minor
'@tanstack/react-hotkeys-devtools': minor
---

The hooks and `HotkeysProvider` are now marked `'use client'`, so a React Server Component such as a Next.js `app/layout.tsx` can render `HotkeysProvider` without a wrapper. Before, the Next.js build failed with `createContext is not a function`. Server components can still import helpers such as `formatForDisplay` from the package.

Both packages now require React 18 or newer. The old `>=16.8` range admitted React 16.8 to 16.13, which can't build the package because `@tanstack/react-store` imports `react/jsx-runtime`.
