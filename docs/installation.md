---
title: Installation
id: installation
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

### Alpine

Use Alpine 3.15.12 or newer within version 3. Install the optional `hotkeysPlugin` before `Alpine.start()`, or create a scope explicitly.

Start with the [Quick Start](./framework/alpine/quick-start), then follow the [guides](./framework/alpine/guides/hotkeys). The package includes the hotkeys adapter; a dedicated Alpine devtools adapter is not provided.

<!-- ::end:framework -->

<!-- ::start:framework -->

### Ember

Use Ember 6.8 or newer. Register hotkeys with imported template helpers in strict-mode `.gts` components. Pass the component as owner to state readers and recorders.

Start with the [Quick Start](./framework/ember/quick-start), then follow the [guides](./framework/ember/guides/hotkeys). The package includes the hotkeys adapter; a dedicated Ember devtools adapter is not provided.

<!-- ::end:framework -->

<!-- ::start:framework -->

### Octane

Use Octane 0.1.36 or newer within version 0.1, with compiler-enabled `.tsrx` components. The Octane adapter requires Node.js 22.22.2 or newer when used in Node.js.

Start with the [Quick Start](./framework/octane/quick-start), then follow the [guides](./framework/octane/guides/hotkeys). The package includes the hotkeys adapter; a dedicated Octane devtools adapter is not provided.

<!-- ::end:framework -->

<!-- ::start:framework -->

### React

Start with the [Quick Start](./framework/react/quick-start) guide. If you want the integrated devtools panel, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

### Preact

Start with the [API reference](./framework/preact/reference/index) and [guides](./framework/preact/guides/hotkeys). If you want the integrated devtools panel, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

### Solid

Start with the [API reference](./framework/solid/reference/index) and [guides](./framework/solid/guides/hotkeys). If you want the integrated devtools panel, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

### Svelte

Start with the [Quick Start](./framework/svelte/quick-start) guide and the Svelte-specific [guides](./framework/svelte/guides/hotkeys). If you want the integrated devtools panel, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

### Angular

Start with the [Quick Start](./framework/angular/quick-start) guide and the Angular-specific [guides](./framework/angular/guides/hotkeys).

The integrated devtools panel requires Angular 21 or newer. To use it, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

### Vue

Start with the [Quick Start](./framework/vue/quick-start) guide and the Vue-specific [guides](./framework/vue/guides/hotkeys).

If you want the Vue devtools panel component, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

### Lit

Start with the [Quick Start](./framework/lit/quick-start) guide and the Lit-specific [guides](./framework/lit/guides/hotkeys).

Lit currently ships the hotkeys adapter only, so no dedicated Lit devtools package is required.

<!-- ::end:framework -->

<!-- ::start:tabs variant="package-manager" -->

angular: @tanstack/angular-devtools
angular: @tanstack/angular-hotkeys-devtools
svelte: @tanstack/svelte-devtools
svelte: @tanstack/svelte-hotkeys-devtools
preact: @tanstack/preact-devtools
preact: @tanstack/preact-hotkeys-devtools
react: @tanstack/react-devtools
react: @tanstack/react-hotkeys-devtools
solid: @tanstack/solid-devtools
solid: @tanstack/solid-hotkeys-devtools
vue: @tanstack/vue-hotkeys-devtools

<!-- ::end:tabs -->

<!-- ::start:framework -->

### React

See the [devtools](./devtools) documentation for setup details.

<!-- ::end:framework -->

<!-- ::start:framework -->

### Preact

See the [devtools](./devtools) documentation for setup details.

<!-- ::end:framework -->

<!-- ::start:framework -->

### Solid

See the [devtools](./devtools) documentation for setup details.

<!-- ::end:framework -->

<!-- ::start:framework -->

### Vue

See the [devtools](./devtools) documentation for setup details.

<!-- ::end:framework -->

<!-- ::start:framework -->

### Angular

See the [devtools](./devtools) documentation for setup details.

<!-- ::end:framework -->

<!-- ::start:framework -->

### Svelte

See the [devtools](./devtools) documentation for setup details.

<!-- ::end:framework -->
