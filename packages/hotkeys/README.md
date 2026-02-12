<div align="center">
  <img src="./media/header_keys.png" >
</div>

<br />

<div align="center">
	<a href="https://www.npmjs.com/package/@tanstack/hotkeys" target="\_parent">
	  <img alt="" src="https://img.shields.io/npm/dm/@tanstack/hotkeys.svg" alt="npm downloads" />
	</a>
	<a href="https://github.com/TanStack/hotkeys" target="\_parent">
	  <img alt="" src="https://img.shields.io/github/stars/TanStack/hotkeys.svg?style=social&label=Star" alt="GitHub stars" />
	</a>
	<a href="https://bundlephobia.com/result?p=@tanstack/react-hotkeys@latest" target="\_parent">
	  <img alt="" src="https://badgen.net/bundlephobia/minzip/@tanstack/react-hotkeys@latest" alt="Bundle size" />
	</a>
</div>

<div align="center">
	<a href="#badge">
	  <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
	</a>
	<a href="#badge">
	  <img src="https://img.shields.io/github/v/release/tanstack/hotkeys" alt="Release"/>
	</a>
	<a href="https://twitter.com/tan_stack">
	  <img src="https://img.shields.io/twitter/follow/tan_stack.svg?style=social" alt="Follow @TanStack"/>
	</a>
</div>

<div align="center">

### [Become a Sponsor!](https://github.com/sponsors/tannerlinsley/)

</div>

# TanStack Hotkeys

Type-safe keyboard shortcuts for the web. Template strings, parsed objects, cross-platform `Mod`, a singleton Hotkey Manager, and utilities for cheatsheet UIs. Built to stay SSR-friendly.

> [!NOTE]
> TanStack Hotkeys is pre-alpha (prototyping phase). We are actively developing the library and are open to feedback and contributions.

## Features

- **Key Bindings**
  - Template strings as the primary syntax: `Mod+Shift+S`, `Control+Shift+A`, `Escape`
  - Parsed objects also supported: `{ key: 'S', ctrl: true, shift: true, alt: false, meta: false, modifiers: ['Control','Shift'] }`
  - Type-safe `Hotkey` for as many valid `event.key` combinations as possible
- **Options**
  - `keydown` / `keyup` via `eventType`
  - `preventDefault`, `stopPropagation`
  - Conditional `enabled` to turn hotkeys on or off
  - `requireReset`: trigger once until all keys are released
- **Cross-Platform Mod**
  - `Mod` maps to **Cmd (Meta)** on macOS and **Ctrl** on Windows/Linux
- **Singleton Hotkey Manager**
  - `getHotkeyManager()`, `HotkeyManager.getInstance()` to register global keyboard shortcuts
  - Single shared listener for efficiency
- **Display Utilities**
  - `formatForDisplay(hotkey)` for cheatsheet UIs (symbols on Mac, labels on Windows/Linux)
  - `formatWithLabels`, `formatHotkey` for flexible output
- **Validation & Matching**
  - `validateHotkey`, `assertValidHotkey`, `checkHotkey` for correctness validation
  - `matchesKeyboardEvent`, `createHotkeyHandler`, `createMultiHotkeyHandler`
- **Sequences**
  - `SequenceManager`, `createSequenceMatcher` for Vim-style multi-key shortcuts (e.g. `['G','G']`, `['D','I','W']`)
- **Key State**
  - `KeyStateTracker`, `getKeyStateTracker` for held-key tracking
- **Hotkey Recorder**
  - `HotkeyRecorder` class for capturing keyboard shortcuts interactively
  - Supports live preview, cancellation, and clearing during recording
- **React Hooks**
  - `useHotkey` – register a keyboard shortcut (global, via singleton manager)
  - `useHotkeySequence` – detect keys pressed in order within a timeout
  - `useHeldKeys` – reactive list of currently held keys
  - `useKeyHold` – reactive boolean for whether a given key is held
  - `useHotkeyRecorder` – record keyboard shortcuts interactively with live preview
- **Devtools**
  - Devtools are a core focus: visibility into all registered hotkeys, scopes, and options
  - `@tanstack/hotkeys-devtools` and `@tanstack/react-hotkeys-devtools` (in active development)
- **Planned**
  - Scoping hotkeys to a DOM element or React ref
  - Warn/error on conflicting shortcuts (TBD)
  - Ignore hotkeys when certain inputs are focused (e.g. `input`, `textarea`)
  - Focus traps and tab-order utilities

### <a href="https://tanstack.com/hotkeys">Read the docs →</a>

<br />

> [!NOTE]
> You may know **TanStack Hotkeys** by our adapter names, too!
>
> - [**React Hotkeys**](https://tanstack.com/hotkeys/latest/docs/framework/react/react-hotkeys)
> - Solid Hotkeys – needs a contributor!
> - Angular Hotkeys – needs a contributor!
> - Svelte Hotkeys – needs a contributor!
> - Vue Hotkeys – needs a contributor!

## Quick Example

```tsx
import { useHotkey, formatForDisplay } from '@tanstack/react-hotkeys'

function Editor() {
  useHotkey(
    'Mod+S',
    (e, { hotkey }) => {
      save()
    },
    { requireReset: true },
  )

  return (
    <div>
      <button>Save</button>
      <span>{formatForDisplay('Mod+S')}</span>{' '}
      {/* e.g. "⌘S" on Mac, "Ctrl+S" on Windows */}
    </div>
  )
}
```

## Packages

- **`@tanstack/hotkeys`** – Core: parse, format, match, validate, manager, sequence, key-state
- **`@tanstack/react-hotkeys`** – React: `useHotkey`, `useHotkeySequence`, `useHeldKeys`, `useKeyHold`, `useHotkeyRecorder`
- **`@tanstack/hotkeys-devtools`** – Base devtools (in development)
- **`@tanstack/react-hotkeys-devtools`** – React devtools (in development)

## Get Involved

- We welcome issues and pull requests!
- Participate in [GitHub discussions](https://github.com/TanStack/hotkeys/discussions)
- Chat with the community on [Discord](https://discord.com/invite/WrRKjPJ)
- See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup instructions

## Partners

<table align="center">
  <tr>
    <td>
      <a href="https://www.coderabbit.ai/?via=tanstack&dub_id=aCcEEdAOqqutX6OS" >
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://tanstack.com/assets/coderabbit-dark-CMcuvjEy.svg" height="40" />
          <source media="(prefers-color-scheme: light)" srcset="https://tanstack.com/assets/coderabbit-light-DVMJ2jHi.svg" height="40" />
          <img src="https://tanstack.com/assets/coderabbit-light-DVMJ2jHi.svg" height="40" alt="CodeRabbit" />
        </picture>
      </a>
    </td>
    <td>
      <a href="https://www.cloudflare.com?utm_source=tanstack">
        <picture>
          <source media="(prefers-color-scheme: dark)" srcset="https://tanstack.com/assets/cloudflare-white-DQDB7UaL.svg" height="60" />
          <source media="(prefers-color-scheme: light)" srcset="https://tanstack.com/assets/cloudflare-black-CPufaW0B.svg" height="60" />
          <img src="https://tanstack.com/assets/cloudflare-black-CPufaW0B.svg" height="60" alt="Cloudflare" />
        </picture>
      </a>
    </td>
  </tr>
</table>

<div align="center">
<img src="https://tanstack.com/assets/partner_logo.svg" alt="Keys & you?" height="65">
<p>
We're looking for TanStack Hotkeys Partners to join our mission! Partner with us to push the boundaries of TanStack Hotkeys and build amazing things together.
</p>
<a href="mailto:partners@tanstack.com?subject=TanStack Hotkeys Partnership"><b>LET'S CHAT</b></a>
</div>

</div>

## Explore the TanStack Ecosystem

- <a href="https://github.com/tanstack/config"><b>TanStack Config</b></a> – Tooling for JS/TS packages
- <a href="https://github.com/tanstack/db"><b>TanStack DB</b></a> – Reactive sync client store
- <a href="https://github.com/tanstack/devtools"><b>TanStack DevTools</b></a> – Unified devtools panel
- <a href="https://github.com/tanstack/form"><b>TanStack Form</b></a> – Type‑safe form state
- <a href="https://github.com/tanstack/hotkeys"><b>TanStack Hotkeys</b></a> – Type‑safe keyboard shortcuts
- <a href="https://github.com/tanstack/query"><b>TanStack Query</b></a> – Async state & caching
- <a href="https://github.com/tanstack/ranger"><b>TanStack Ranger</b></a> – Range & slider primitives
- <a href="https://github.com/tanstack/router"><b>TanStack Router</b></a> – Type‑safe routing, caching & URL state
- <a href="https://github.com/tanstack/start"><b>TanStack Start</b></a> – Full‑stack SSR & streaming
- <a href="https://github.com/tanstack/store"><b>TanStack Store</b></a> – Reactive data store
- <a href="https://github.com/tanstack/table"><b>TanStack Table</b></a> – Headless datagrids
- <a href="https://github.com/tanstack/virtual"><b>TanStack Virtual</b></a> – Virtualized rendering

… and more at <a href="https://tanstack.com"><b>TanStack.com »</b></a>
