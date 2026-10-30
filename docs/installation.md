---
title: Installation
id: installation
description: Install the TanStack Hotkeys adapter for React, Preact, Solid, Angular, Vue, Svelte, Lit, Alpine, Ember, or Octane, plus the optional devtools.
---

Install the adapter for your framework with your preferred package manager:

<!-- ::start:tabs variant="package-managers" -->

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

Each framework package re-exports everything from the core `@tanstack/hotkeys` package, so you don't need to install the core package separately.

> [!NOTE]
> If you are not using a framework, you can install the core `@tanstack/hotkeys` package directly for use with vanilla JavaScript.

<!-- ::start:framework -->

# React

Use React 18 or newer. The hooks and `HotkeysProvider` are client components, so a server component such as a Next.js `app/layout.tsx` can render `HotkeysProvider` directly.

Start with the [Quick Start](./framework/react/quick-start) guide. If you want the integrated devtools panel, also install:

# Preact

Use Preact 10.5.2 or newer. TypeScript with `"moduleResolution": "bundler"` needs Preact 10.7.2 or newer.

Start with the [Quick Start](./framework/preact/quick-start) guide and the Preact-specific [guides](./framework/preact/guides/hotkeys). If you want the integrated devtools panel, also install:

# Solid

`@tanstack/solid-hotkeys` 0.19 and later work with Solid 2; for Solid 1 (1.7 or newer), install `@tanstack/solid-hotkeys@0.18`. The devtools panel still runs on Solid 1 (1.9.15 or newer) and isn't available for Solid 2 apps yet.

Start with the [Quick Start](./framework/solid/quick-start) guide and the Solid-specific [guides](./framework/solid/guides/hotkeys). If you want the integrated devtools panel, also install:

# Angular

Use Angular 19 or newer.

Start with the [Quick Start](./framework/angular/quick-start) guide and the Angular-specific [guides](./framework/angular/guides/hotkeys).

The integrated devtools panel requires Angular 21 or newer. To use it, also install:

# Vue

Use Vue 3.3 or newer.

Start with the [Quick Start](./framework/vue/quick-start) guide and the Vue-specific [guides](./framework/vue/guides/hotkeys).

If you want the Vue devtools panel component, also install:

# Svelte

Use Svelte 5.40 or newer within version 5.

Start with the [Quick Start](./framework/svelte/quick-start) guide and the Svelte-specific [guides](./framework/svelte/guides/hotkeys). If you want the integrated devtools panel, also install:

# Lit

Use Lit 3 or newer.

Start with the [Quick Start](./framework/lit/quick-start) guide and the Lit-specific [guides](./framework/lit/guides/hotkeys).

Lit currently ships the hotkeys adapter only, so no dedicated Lit devtools package is required.

# Alpine

Use Alpine 3.13 or newer within version 3. Install `hotkeysPlugin` with `Alpine.plugin(hotkeysPlugin)` before `Alpine.start()`, so the adapter uses your Alpine instance.

Start with the [Quick Start](./framework/alpine/quick-start), then follow the [guides](./framework/alpine/guides/hotkeys). The package includes the hotkeys adapter; a dedicated Alpine devtools adapter is not provided.

# Ember

Use Ember 6.8.3 or newer, except 6.9.0 and 6.10.0. The adapter works in Vite (Embroider) apps and in classic ember-cli apps that use ember-auto-import. Register hotkeys with imported template helpers in strict-mode `.gts` components. Pass the component as owner to state readers and recorders.

Start with the [Quick Start](./framework/ember/quick-start), then follow the [guides](./framework/ember/guides/hotkeys). The package includes the hotkeys adapter; a dedicated Ember devtools adapter is not provided.

# Octane

Use Octane 0.12 or newer, with compiler-enabled `.tsrx` components. The Octane adapter requires Node.js 22.22.2 or newer when used in Node.js.

Start with the [Quick Start](./framework/octane/quick-start), then follow the [guides](./framework/octane/guides/hotkeys). The package includes the hotkeys adapter; a dedicated Octane devtools adapter is not provided.

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

See the [devtools](./devtools) documentation for setup details.

# Preact

See the [devtools](./devtools) documentation for setup details.

# Solid

See the [devtools](./devtools) documentation for setup details.

# Angular

See the [devtools](./devtools) documentation for setup details.

# Vue

See the [devtools](./devtools) documentation for setup details.

# Svelte

See the [devtools](./devtools) documentation for setup details.

<!-- ::end:framework -->
