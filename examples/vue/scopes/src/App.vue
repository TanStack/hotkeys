<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
import { TanStackDevtools } from '@tanstack/vue-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/vue-hotkeys-devtools'
import { provideActivity } from './activity'
import ActivityLog from './ActivityLog.vue'
import DialogDemo from './DialogDemo.vue'
import NestedDemo from './NestedDemo.vue'
import Palette from './Palette.vue'
import ScopeFrame from './ScopeFrame.vue'
import TabsDemo from './TabsDemo.vue'

// Every hotkey in this example is a plain `useHotkey` call with no `scope`
// option. It registers in the scope of the nearest `HotkeysProvider` that
// sets one.
provideActivity()
</script>

<template>
  <HotkeysProvider>
    <div class="app">
      <header>
        <h1>Hotkey scopes</h1>
        <p>
          Each nested <code>HotkeysProvider</code> with a <code>scope</code> is
          a scope. Its hotkeys fire while it is mounted and enabled. Open the
          hotkeys devtools to see which scopes are active, suspended, or
          allowed.
        </p>
      </header>
      <ScopeFrame>
        <HotkeysProvider scope="palette">
          <ScopeFrame scope="palette">
            <Palette />
          </ScopeFrame>
        </HotkeysProvider>
        <HotkeysProvider scope="document">
          <ScopeFrame scope="document">
            <NestedDemo />
          </ScopeFrame>
        </HotkeysProvider>
        <HotkeysProvider scope="mail">
          <ScopeFrame scope="mail">
            <TabsDemo />
          </ScopeFrame>
        </HotkeysProvider>
        <HotkeysProvider scope="settings">
          <ScopeFrame scope="settings">
            <DialogDemo />
          </ScopeFrame>
        </HotkeysProvider>
        <ActivityLog />
      </ScopeFrame>
    </div>
  </HotkeysProvider>
  <TanStackDevtools :plugins="[hotkeysDevtoolsPlugin()]" />
</template>
