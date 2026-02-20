---
title: Installation
id: installation
---

TanStack Hotkeys is compatible with various front-end frameworks. Install the corresponding adapter for your framework using your preferred package manager:

<!-- ::start:tabs variant="package-managers" -->

react: @tanstack/react-hotkeys
solid: @tanstack/solid-hotkeys
angular: @tanstack/angular-hotkeys

<!-- ::end:tabs -->

Each framework package re-exports everything from the core `@tanstack/hotkeys` package, so there is no need to install the core package separately.

> [!NOTE]
> If you are not using a framework, you can install the core `@tanstack/hotkeys` package directly for use with vanilla JavaScript.

<!-- ::start:framework -->

# React

## Devtools

Developer tools are available using [TanStack Devtools](https://tanstack.com/devtools/latest). Install the devtools adapter and the Hotkeys devtools plugin as dev dependencies to inspect registered hotkeys and monitor key state.

<!-- ::end:framework -->

<!-- ::start:tabs variant="package-manager" -->

react: @tanstack/react-devtools
react: @tanstack/react-hotkeys-devtools

<!-- ::end:tabs -->

<!-- ::start:framework -->

# React

See the [devtools](./devtools) documentation for more information on how to set up and use the Hotkeys devtools.

<!-- ::end:framework -->
