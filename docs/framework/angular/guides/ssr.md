---
title: Server-Side Rendering and Hydration in Angular
id: ssr
description: Render platform-accurate shortcut labels without hydration mismatches in Angular SSR and Analog, and handle prerendered pages.
---

TanStack Hotkeys works in server-rendered and static Angular apps without hydration errors. Use the setup that matches how your app renders:

| App setup | What to configure |
| --- | --- |
| Browser-only app (no server rendering) | Nothing needed |
| Server-rendered per request | Set `platform` in `provideHotkeys` from the request ([details](#format-labels-in-server-rendered-apps)) |
| Static or prerendered pages | Render labels in a `@defer` block, or allow the Linux fallback until hydration ([details](#static-and-prerendered-pages)) |

## Format labels in server-rendered apps

The server doesn't know the user's platform. Without one, a label rendered on the server uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML and `⌘ S` once Angular hydrates the component. To render the right label from the start:

1. Read the request's `User-Agent` header on the server, and pass `detectPlatform(userAgent)` as the provider's `platform`.
2. Format labels with `injectFormatForDisplay()`. It reads the provider, so it uses the platform from step 1.

```ts
import { REQUEST, inject } from '@angular/core'
import { detectPlatform, provideHotkeys } from '@tanstack/angular-hotkeys'

provideHotkeys({
  defaultOptions: () => ({
    platform: detectPlatform(
      inject(REQUEST)?.headers.get('user-agent'),
    ),
  }),
})
```

```ts
import { Component } from '@angular/core'
import { injectFormatForDisplay } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-toolbar',
  template: `
    <ul>
      @for (command of commands; track command.id) {
        <li>{{ command.name }} <kbd>{{ formatForDisplay(command.hotkey) }}</kbd></li>
      }
    </ul>
  `,
})
export class ToolbarComponent {
  // Call it in an injection context, such as a field initializer
  readonly formatForDisplay = injectFormatForDisplay()
}
```

Inject it once, then call the function anywhere, including in templates. The function reads the provider's `platform` each time it runs, so a template updates when the platform changes. A `platform` passed to the function wins over the provider's.

In the browser, `detectPlatform()` reads the browser's own `navigator`, so the server and the browser get the same platform for practically every user. The provider's `platform` is also the default platform for hotkeys and recorders inside it. The provider that holds `appHotkeys` also compares app hotkeys on its platform, such as for conflicts. An inner provider inherits it.

Without a provider `platform`, `injectFormatForDisplay` renders `'linux'` labels on the server. Mac users see `Ctrl+S` until Angular hydrates the component. Set the provider's `platform` to avoid that.

The provider must run on the server too, so provide it where the request is available, as shown for each framework below.

Pages rendered this way depend on the request's `User-Agent` header. If a CDN or another shared cache stores them, it can serve one user's labels, and the platform that `Mod` resolves to, to other users. Keep these pages out of shared caches, or add the platform to the cache key. `Vary: User-Agent` also works, but it splits the cache into many small entries.

### Angular SSR

The `REQUEST` token from `@angular/core` is the current request on the server and `null` in the browser. Without a user agent, `detectPlatform` reads the browser's `navigator`, so the same provider works on both sides. Add it to the application config that the browser and server configs share:

```ts
// src/app/app.config.ts
import { REQUEST, inject } from '@angular/core'
import type { ApplicationConfig } from '@angular/core'
import { provideClientHydration } from '@angular/platform-browser'
import { detectPlatform, provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(),
    provideHotkeys({
      defaultOptions: () => ({
        platform: detectPlatform(
          inject(REQUEST)?.headers.get('user-agent'),
        ),
      }),
    }),
  ],
}
```

`REQUEST` is also `null` when a route is prerendered. See [Static and prerendered pages](#static-and-prerendered-pages).

The [Angular SSR example](../examples/injectFormatForDisplay-angular-ssr) shows this setup.

### Analog

`injectRequest()` from `@analogjs/router/tokens` returns the server's request on the server and `null` in the browser. The request is a Node.js request, so read the header from `headers`:

```ts
// src/app/app.config.ts
import type { ApplicationConfig } from '@angular/core'
import { injectRequest } from '@analogjs/router/tokens'
import { detectPlatform, provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    // ...your other providers
    provideHotkeys({
      defaultOptions: () => ({
        platform: detectPlatform(injectRequest()?.headers['user-agent']),
      }),
    }),
  ],
}
```

The [Analog example](../examples/injectFormatForDisplay-analog) shows this setup.

### Render a label only in the browser

To skip server rendering for a label instead, render it in a `@defer` block. On the server, Angular renders only the block's `@placeholder`. Without a provider `platform`, the function from `injectFormatForDisplay` detects the platform in the browser:

```ts
import { Component } from '@angular/core'
import { injectFormatForDisplay } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-save-button',
  template: `
    <button (click)="save()">
      Save
      @defer (on immediate) {
        <kbd>{{ formatForDisplay('Mod+S') }}</kbd>
      } @placeholder {
        <kbd>&nbsp;</kbd>
      }
    </button>
  `,
})
export class SaveButtonComponent {
  readonly formatForDisplay = injectFormatForDisplay()

  save() {
    // ...
  }
}
```

To set a label from code instead, store it in a signal and set it in `afterNextRender`, which runs only in the browser. Don't switch templates with `isPlatformBrowser`: the server and the browser then render different content, which breaks hydration. A placeholder with the label's width keeps the layout from shifting.

### Static and prerendered pages

A page rendered at build time has no request and no user, so `injectFormatForDisplay` can't know the platform. This includes routes with `RenderMode.Prerender` in `app.routes.server.ts`, and Analog's prerendered routes. Without a provider `platform`, `injectFormatForDisplay` shows `'linux'` labels until Angular hydrates the component, then switches. To show nothing until then, render the labels only in the browser, as above. To render labels for each user instead, set the route's render mode to `RenderMode.Server`.

### Development warning

In development, formatting a label on the server without a platform logs a warning once, because users on macOS and Windows would get a `'linux'` label first. The warning names the missing setting. It isn't included in production builds.
