---
title: Server-Side Rendering and Hydration in Lit
id: ssr
description: Render platform-accurate shortcut labels in Lit elements rendered with @lit-labs/ssr, so macOS and Windows users never see a Linux label in the server's HTML.
---

TanStack Hotkeys works in Lit apps rendered on the server with `@lit-labs/ssr`. Use the setup that matches how your app renders:

| App setup | What to configure |
| --- | --- |
| Browser-only (Vite, client-rendered elements) | Nothing needed |
| Server-rendered with `@lit-labs/ssr` | Give each element that shows labels a `platform` property, and set it to `detectPlatform(userAgent)` on the server ([details](#format-labels-in-server-rendered-apps)) |

Lit has no provider, so the platform goes on the element that formats the labels. Decorators and controllers need no server setup. See [What runs on the server](#what-runs-on-the-server).

## Format labels in server-rendered apps

With Lit SSR, the server doesn't know the user's platform. Without one, a label rendered on the server uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML. Hydration doesn't fix it. Lit expects the browser's first render to match the server's HTML, and keeps the server's text. To render the right label from the start:

1. Give the element a `platform` property, and pass the controller a function that reads it. Lit has no provider, so the controller's options are where the platform goes.
2. Read the request's `User-Agent` header on the server, and set the element's `platform` attribute to `detectPlatform(userAgent)`.

```ts
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { FormatForDisplayController } from '@tanstack/lit-hotkeys'
import type { HotkeyPlatform } from '@tanstack/lit-hotkeys'

@customElement('save-button')
class SaveButton extends LitElement {
  @property() platform?: HotkeyPlatform

  // The function is read for each label, so it follows the property
  private formatForDisplay = new FormatForDisplayController(this, () => ({
    platform: this.platform,
  }))

  render() {
    return html`
      <button>
        Save <kbd>${this.formatForDisplay.format('Mod+S')}</kbd>
      </button>
    `
  }
}
```

On the server, set the attribute:

```ts
import { render } from '@lit-labs/ssr'
import { html } from 'lit'
import { detectPlatform } from '@tanstack/lit-hotkeys'

const platform = detectPlatform(userAgent)
const result = render(html`<save-button platform=${platform}></save-button>`)
```

Every label in the element then uses the property's platform. A `platform` passed to `format` wins over it.

The attribute is part of the server's HTML, so the element reads the same `platform` when it upgrades in the browser. Pass it on to child elements that show labels, such as `.platform=${this.platform}`. An element that renders only in the browser needs no `platform`, because the controller detects it.

Labels have no keyboard layout on the server or in an element's first render, so they hydrate unchanged. See [Label physical keys for the user's keyboard](./formatting-display#label-physical-keys-for-the-users-keyboard).

> [!NOTE]
> **Caching.** Pages rendered this way depend on the request's `User-Agent` header. A CDN or another shared cache can serve one user's labels, and the platform that `Mod` resolves to, to other users. Keep these pages out of shared caches, or add the platform to the cache key. `Vary: User-Agent` also works, but it splits the cache into many small entries.

## What runs on the server

During server rendering, controllers register nothing and subscribe to nothing, even with `@lit-labs/ssr`'s `connectedCallback: true` option and its global DOM shim. Read-side controllers report the current state, so the server HTML matches the first client render.

Registration happens when the element connects in the browser. A hotkey on a server-rendered element starts working after the element upgrades.
