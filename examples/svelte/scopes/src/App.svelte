<script lang="ts">
  import ActivityLog from './ActivityLog.svelte'
  import DialogDemo from './DialogDemo.svelte'
  import NestedDemo from './NestedDemo.svelte'
  import Palette from './Palette.svelte'
  import Scope from './Scope.svelte'
  import ScopeFrame from './ScopeFrame.svelte'
  import TabsDemo from './TabsDemo.svelte'

  // Every hotkey in this example is a plain `createHotkey` call with no
  // `scope` option. It registers in the scope of the nearest
  // `HotkeysProvider` that sets one.
</script>

<div class="app">
  <header>
    <h1>Hotkey scopes</h1>
    <p>
      Each nested <code>HotkeysProvider</code> with a <code>scope</code> is a scope.
      Its hotkeys fire while it is mounted and enabled. Open the hotkeys devtools
      to see which scopes are active, suspended, or allowed.
    </p>
  </header>
  <ScopeFrame>
    <Scope scope="palette"><Palette /></Scope>
    <Scope scope="document"><NestedDemo /></Scope>
    <Scope scope="mail"><TabsDemo /></Scope>
    <Scope scope="settings"><DialogDemo /></Scope>
    <ActivityLog />
  </ScopeFrame>
</div>
