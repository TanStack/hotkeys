<script lang="ts">
  import {
    formatKeyForDebuggingDisplay,
    getHeldKeys,
    getHeldKeyCodesMap,
  } from '@tanstack/svelte-hotkeys'

  const heldKeys = getHeldKeys()
  const heldKeyCodesMap = getHeldKeyCodesMap()

  let history = $state<Array<string>>([])

  $effect(() => {
    if (heldKeys.keys.length > 0) {
      const combo = heldKeys.keys
        .map((k) => formatKeyForDebuggingDisplay(k))
        .join(' + ')
      if (history[history.length - 1] !== combo) {
        history = [...history.slice(-9), combo]
      }
    }
  })
</script>

<div class="app">
  <header>
    <h1>getHeldKeys</h1>
    <p>
      Returns an array of all currently pressed keys. Useful for displaying key
      combinations or building custom shortcut recording.
    </p>
  </header>

  <main>
    <section class="demo-section">
      <h2>Currently Held Keys</h2>
      <div class="key-display">
        {#if heldKeys.keys.length > 0}
          {#each heldKeys.keys as key, index}
            {@const code = heldKeyCodesMap.codes[key]}
            {#if index > 0}
              <span class="plus">+</span>
            {/if}
            <kbd class="large">
              {formatKeyForDebuggingDisplay(key)}
              {#if code && code !== key}
                <small class="code-label">
                  {formatKeyForDebuggingDisplay(code, {
                    source: 'code',
                  })}
                </small>
              {/if}
            </kbd>
          {/each}
        {:else}
          <span class="placeholder">Press any keys...</span>
        {/if}
      </div>
      <div class="stats">
        Keys held: <strong>{heldKeys.keys.length}</strong>
      </div>
    </section>

    <section class="demo-section">
      <h2>Usage</h2>
      <pre
        class="code-block">{`import { getHeldKeys } from '@tanstack/svelte-hotkeys'

const heldKeys = getHeldKeys()

// In template:
// Currently pressed: {heldKeys.keys.join(' + ') || 'None'}`}</pre>
    </section>

    <section class="demo-section">
      <h2>Try These Combinations</h2>
      <ul>
        <li>
          Hold <kbd>Shift</kbd> + <kbd>Control</kbd> + <kbd>A</kbd>
        </li>
        <li>Press multiple letter keys at once</li>
        <li>Hold modifiers and watch them appear</li>
        <li>Release keys one by one</li>
      </ul>
    </section>

    <section class="demo-section">
      <h2>Recent Combinations</h2>
      {#if history.length > 0}
        <ul class="history-list">
          {#each history as combo}
            <li>{combo}</li>
          {/each}
        </ul>
        <button onclick={() => (history = [])}>Clear History</button>
      {:else}
        <p class="placeholder">Press some key combinations...</p>
      {/if}
    </section>

    <section class="demo-section">
      <h2>Use Cases</h2>
      <ul>
        <li>Building a keyboard shortcut recorder</li>
        <li>Displaying currently held keys to users</li>
        <li>Debugging keyboard input</li>
        <li>Creating key combination tutorials</li>
      </ul>
    </section>
  </main>
</div>
