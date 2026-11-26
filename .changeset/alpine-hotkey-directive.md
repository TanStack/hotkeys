---
'@tanstack/alpine-hotkeys': minor
---

Add the `x-hotkey` directive, installed with `Alpine.plugin(hotkeyDirective)`. Name the hotkey with modifiers and give the callback as the expression: `x-hotkey.mod.s="save()"`, `x-hotkey.escape="close()"`, or `x-hotkey.g.h="goHome()"` for a sequence. The hotkey lives as long as the attribute, so a morph that changes or removes it, as Livewire does on every update, replaces or removes the hotkey. A changed `x-init="$hotkeys.createHotkey(...)"` stays registered until its element is removed. With Alpine's CSP build, name a component method: `x-hotkey.mod.s="save"`. A page that only uses `x-hotkey` doesn't ship the `$hotkeys` owners and readers.
