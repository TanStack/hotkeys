---
title: Server-Side Rendering and Hydration in Ember
id: ssr
description: Render platform-accurate shortcut labels in Ember apps rendered with FastBoot or Prember, so macOS and Windows users don't see a Linux label before the app boots.
---

TanStack Hotkeys works in Ember apps rendered on the server with FastBoot and in pages prerendered with Prember. Use the setup that matches how your app renders:

| App setup | What to configure |
| --- | --- |
| Browser-only SPA | Nothing needed |
| FastBoot, rendered per request | Pass `detectPlatform(userAgent)` as the `platform` of a `createHotkeysScope` scope, and pass the scope to `useFormatForDisplay` ([details](#format-labels-in-server-rendered-apps)) |
| Prember static or prerendered pages | Nothing, or render labels only in the browser ([details](#static-and-prerendered-pages)) |

Ember has no provider, so the platform lives on a scope you create and pass to the components that format labels.

## Format labels in server-rendered apps

The server doesn't know the user's platform. Without one, a label rendered in FastBoot uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML and `⌘ S` once the app boots in the browser. To render the right label from the start:

1. Read the request's `User-Agent` header from the `fastboot` service, and pass `detectPlatform(userAgent)` as the `platform` of a `createHotkeysScope` scope.
2. Format labels with `useFormatForDisplay(scope)`. It reads the scope, so it uses the platform from step 1.

Create the scope in a component near the top of your app, such as the one your application template renders:

```gts
// app/components/app-shell.gts
import Component from '@glimmer/component'
import { service } from '@ember/service'
import { createHotkeysScope, detectPlatform } from '@tanstack/ember-hotkeys'
import Toolbar from './toolbar'

// ember-cli-fastboot doesn't ship types, so declare the part you use
interface FastBootService {
  request: { headers: { get(name: string): string | null } } | null
}

export default class AppShell extends Component {
  @service declare fastboot: FastBootService

  hotkeys = createHotkeysScope({
    platform: detectPlatform(
      this.fastboot.request?.headers.get('user-agent'),
    ),
  })

  <template>
    <Toolbar @hotkeys={{this.hotkeys}} />
  </template>
}
```

```gts
// app/components/toolbar.gts
import Component from '@glimmer/component'
import { useFormatForDisplay } from '@tanstack/ember-hotkeys'
import type { EmberHotkeysScope, Hotkey } from '@tanstack/ember-hotkeys'

const commands: Array<{ name: string; hotkey: Hotkey }> = [
  { name: 'Save', hotkey: 'Mod+S' },
  { name: 'Search', hotkey: 'Mod+K' },
]

interface ToolbarSignature {
  Args: { hotkeys: EmberHotkeysScope }
}

export default class Toolbar extends Component<ToolbarSignature> {
  formatForDisplay = useFormatForDisplay(this.args.hotkeys)

  <template>
    <ul>
      {{#each commands as |command|}}
        <li>{{command.name}} <kbd>{{this.formatForDisplay command.hotkey}}</kbd></li>
      {{/each}}
    </ul>
  </template>
}
```

Call the utility once in a class field, then call the function anywhere, including in the template's loops and conditions. It reads the scope's `platform` each time it formats, so labels update when the scope's defaults change. A `platform` passed to the function wins over the scope's.

- In the browser, `fastboot.request` is `null`, so `detectPlatform()` reads the browser's `navigator`. The server and the browser get the same platform for practically every user.
- The scope's `platform` is also the default platform for the hotkeys and recorders that use the scope. Pass the scope to child components, such as `@hotkeys={{this.hotkeys}}`, so their labels use the same platform.
- Without a scope `platform`, `useFormatForDisplay` renders `'linux'` labels in FastBoot. By default, the app replaces the server's HTML when it boots in the browser, so the labels then switch to the browser's platform. Mac users see `Ctrl+S` until the app boots.

> [!NOTE]
> **Caching.** Pages rendered this way depend on the request's `User-Agent` header. A CDN or another shared cache can serve one user's labels, and the platform that `Mod` resolves to, to other users. Keep these pages out of shared caches, or add the platform to the cache key. `Vary: User-Agent` also works, but it splits the cache into many small entries.

### Render a label only in the browser

To leave a label out of the server's HTML instead, check the `fastboot` service's `isFastBoot`. A label that first renders in the browser gets the browser's platform from `useFormatForDisplay` at once:

```gts
import Component from '@glimmer/component'
import { service } from '@ember/service'
import { useFormatForDisplay } from '@tanstack/ember-hotkeys'

interface FastBootService {
  isFastBoot: boolean
}

export default class SaveShortcut extends Component {
  @service declare fastboot: FastBootService

  formatForDisplay = useFormatForDisplay()

  <template>
    {{#if this.fastboot.isFastBoot}}
      <kbd>&nbsp;</kbd>
    {{else}}
      <kbd>{{this.formatForDisplay 'Mod+S'}}</kbd>
    {{/if}}
  </template>
}
```

`isFastBoot` is `true` only while the app renders in FastBoot. A placeholder with the label's width keeps the layout from shifting.

### Static and prerendered pages

Prember renders pages with FastBoot at build time. A page rendered at build time has no request and no user, so `useFormatForDisplay` can't know the platform. The scope recipe above gets `'linux'` there, because the build sends no `User-Agent` header. Without a scope `platform`, `useFormatForDisplay` shows `'linux'` labels until the app boots, then switches. To show nothing until then, render the labels only in the browser, as above.

### Development warning

In development, formatting a label in FastBoot without a platform logs a warning once. Without a platform, FastBoot renders `'linux'` labels, so users on macOS and Windows get a different label once the app boots. A developer on Linux never sees the problem, which is why the warning exists. The warning isn't included in production builds.
