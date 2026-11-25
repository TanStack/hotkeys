---
'@tanstack/hotkeys': minor
---

Remove `conflictBehavior: 'replace'`. It silently unregistered the earlier of two duplicate registrations, so whichever mounted last won and the earlier one never came back, and in framework adapters the next render registered the earlier one again. Use scopes for a hotkey that takes over a key and hands it back, and register a hotkey once at a shared owner when two components would register the same one. `'warn'` (the default), `'error'`, and `'allow'` remain.
