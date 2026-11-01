---
'@tanstack/hotkeys': patch
---

Fix `formatForDisplay` throwing during server rendering on runtimes without `process`, such as Cloudflare Workers.
