---
title: Installation
id: installation
description: Install the TanStack Hotkeys adapter for React, Preact, Solid, Angular, Vue, Svelte, Lit, Alpine, Ember, or Octane, plus the optional devtools.
---

Install the adapter for your framework with your preferred package manager:

<!-- ::start:tabs variant="package-manager" -->

alpine: @tanstack/alpine-hotkeys
angular: @tanstack/angular-hotkeys
ember: @tanstack/ember-hotkeys
octane: @tanstack/octane-hotkeys
lit: @tanstack/lit-hotkeys
preact: @tanstack/preact-hotkeys
react: @tanstack/react-hotkeys
solid: @tanstack/solid-hotkeys
svelte: @tanstack/svelte-hotkeys
vue: @tanstack/vue-hotkeys

<!-- ::end:tabs -->

Every framework adapter re-exports the core `@tanstack/hotkeys` package, so you don't need to install both.

> [!NOTE]
> Not using a framework? Install `@tanstack/hotkeys` directly for vanilla JavaScript or TypeScript.

<!-- ::start:framework -->

# React

Requires React 18 or newer. `useHotkey` is a client hook and `HotkeysProvider` is a client component, so server components like Next.js `app/layout.tsx` can render `HotkeysProvider` directly. To pass `appHotkeys` from a Server Component, use `AppHotkeysProvider` instead. See [App hotkeys with Server Components](./framework/react/guides/ssr#app-hotkeys-with-server-components).

Start with the [React Quick Start](./framework/react/quick-start). To add the devtools panel, install:

# Preact

Requires Preact 10.5.2 or newer (10.7.2 or newer when using TypeScript `"moduleResolution": "bundler"`).

Start with the [Preact Quick Start](./framework/preact/quick-start) and [Preact guides](./framework/preact/guides/hotkeys). To add the devtools panel, install:

# Solid

Requires Solid 2 (Node 22.12 or newer) for `@tanstack/solid-hotkeys` 0.26 and newer, and `@tanstack/solid-hotkeys-devtools` 0.14 and newer. For Solid 1 (1.7 or newer), install `@tanstack/solid-hotkeys@0.25` and `@tanstack/solid-hotkeys-devtools@0.13` (for Solid 1.9.15 or newer).

Start with the [Solid Quick Start](./framework/solid/quick-start) and [Solid guides](./framework/solid/guides/hotkeys). To add the devtools panel, install:

# Angular

Requires Angular 19 or newer (21 or newer for the integrated devtools panel).

Start with the [Angular Quick Start](./framework/angular/quick-start) and [Angular guides](./framework/angular/guides/hotkeys). To add the devtools panel, install:

# Vue

Requires Vue 3.3 or newer.

Start with the [Vue Quick Start](./framework/vue/quick-start) and [Vue guides](./framework/vue/guides/hotkeys). To add the devtools panel, install:

# Svelte

Requires Svelte 5.40 or newer within version 5.

Start with the [Svelte Quick Start](./framework/svelte/quick-start) and [Svelte guides](./framework/svelte/guides/hotkeys). To add the devtools panel, install:

# Lit

Requires Lit 3 or newer.

Start with the [Lit Quick Start](./framework/lit/quick-start) and [Lit guides](./framework/lit/guides/hotkeys). Lit ships the hotkeys adapter only and has no dedicated devtools package.

# Alpine

Requires Alpine 3.13 or newer within version 3. Register `hotkeysPlugin` with `Alpine.plugin(hotkeysPlugin)` before calling `Alpine.start()`.

Start with the [Alpine Quick Start](./framework/alpine/quick-start) and [Alpine guides](./framework/alpine/guides/hotkeys). Alpine ships the hotkeys adapter only and has no dedicated devtools package.

# Ember

Requires Ember 4.12 or newer, and works with Vite (Embroider) or classic `ember-cli` with `ember-auto-import` 2. Register hotkeys in strict-mode `.gts` components and pass the component as owner to state readers and recorders.

Start with the [Ember Quick Start](./framework/ember/quick-start) and [Ember guides](./framework/ember/guides/hotkeys). Ember ships the hotkeys adapter only and has no dedicated devtools package.

# Octane

Requires Octane 0.12 or newer with compiler-enabled `.tsrx` components, and Node.js 22.22.2 or newer when running in Node.js.

Start with the [Octane Quick Start](./framework/octane/quick-start) and [Octane guides](./framework/octane/guides/hotkeys). Octane ships the hotkeys adapter only and has no dedicated devtools package.

<!-- ::end:framework -->

<!-- ::start:tabs variant="package-manager" -->

react: @tanstack/react-devtools
react: @tanstack/react-hotkeys-devtools
preact: @tanstack/preact-devtools
preact: @tanstack/preact-hotkeys-devtools
solid: @tanstack/solid-devtools
solid: @tanstack/solid-hotkeys-devtools
angular: @tanstack/angular-devtools
angular: @tanstack/angular-hotkeys-devtools
vue: @tanstack/vue-hotkeys-devtools
svelte: @tanstack/svelte-devtools
svelte: @tanstack/svelte-hotkeys-devtools

<!-- ::end:tabs -->

<!-- ::start:framework -->

# React

See [Devtools](./devtools) for setup instructions.

# Preact

See [Devtools](./devtools) for setup instructions.

# Solid

See [Devtools](./devtools) for setup instructions.

# Angular

See [Devtools](./devtools) for setup instructions.

# Vue

See [Devtools](./devtools) for setup instructions.

# Svelte

See [Devtools](./devtools) for setup instructions.

<!-- ::end:framework -->
