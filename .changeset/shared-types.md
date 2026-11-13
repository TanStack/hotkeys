---
'@tanstack/hotkeys': minor
'@tanstack/hotkeys-devtools': minor
'@tanstack/react-hotkeys': patch
'@tanstack/preact-hotkeys': patch
'@tanstack/solid-hotkeys': patch
'@tanstack/vue-hotkeys': patch
'@tanstack/svelte-hotkeys': patch
'@tanstack/angular-hotkeys': patch
'@tanstack/lit-hotkeys': patch
'@tanstack/alpine-hotkeys': patch
'@tanstack/octane-hotkeys': patch
'@tanstack/ember-hotkeys': patch
'@tanstack/react-hotkeys-devtools': patch
'@tanstack/preact-hotkeys-devtools': patch
'@tanstack/solid-hotkeys-devtools': patch
'@tanstack/vue-hotkeys-devtools': patch
'@tanstack/svelte-hotkeys-devtools': patch
'@tanstack/angular-hotkeys-devtools': patch
---

Types that every adapter wrote out for itself now come from one place in `@tanstack/hotkeys`.

- New types: `MaybeGetter`, `HotkeyEventType`, `KeyIdentity`, `ResolvableModifier`, `HotkeyCommonOptions`, `HotkeyRegistrationsResult`, `RegisteredAppHotkeyListItem`, `CustomHotkeyActions` and `HotkeyRecorderActions`. `HotkeyRecorderState` takes the recorded hotkey type as an optional type argument.
- Each adapter's types, such as `UseCustomHotkeysResult` and `ReactHotkeyRecorder`, now extend these, and keep their names.
- `@tanstack/hotkeys/adapter` adds helpers that the adapters shared by copy: hint visibility, the label formatter, keyboard layout following, the app hotkeys store lookup and custom hotkey actions.
- `@tanstack/hotkeys-devtools` exports `HOTKEYS_DEVTOOLS_PLUGIN_NAME`, `HOTKEYS_DEVTOOLS_DEFAULT_PROPS` and `HotkeysDevtoolsRenderPlugin`, which the framework devtools plugins extend.

Behavior is unchanged.
