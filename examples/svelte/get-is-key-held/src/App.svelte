<script lang="ts">
  import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'

  const isShiftHeld = getIsKeyHeld('Shift')
  const isControlHeld = getIsKeyHeld('Control')
  const isAltHeld = getIsKeyHeld('Alt')
  const isMetaHeld = getIsKeyHeld('Meta')
  const isSpaceHeld = getIsKeyHeld('Space')
</script>

<div class="app">
  <header>
    <h1>getIsKeyHeld</h1>
    <p>
      Returns a boolean indicating if a specific key is currently held.
      Optimized to only re-render when that specific key changes.
    </p>
  </header>

  <main>
    <section class="demo-section">
      <h2>Modifier Key States</h2>
      <div class="modifier-grid">
        <div class="modifier-indicator" class:active={isShiftHeld.held}>
          <span class="key-name">Shift</span>
          <span class="status">
            {isShiftHeld.held ? 'HELD' : 'Released'}
          </span>
        </div>
        <div class="modifier-indicator" class:active={isControlHeld.held}>
          <span class="key-name">Control</span>
          <span class="status">
            {isControlHeld.held ? 'HELD' : 'Released'}
          </span>
        </div>
        <div class="modifier-indicator" class:active={isAltHeld.held}>
          <span class="key-name">Alt / Option</span>
          <span class="status">{isAltHeld.held ? 'HELD' : 'Released'}</span>
        </div>
        <div class="modifier-indicator" class:active={isMetaHeld.held}>
          <span class="key-name">Meta (⌘ / ⊞)</span>
          <span class="status">{isMetaHeld.held ? 'HELD' : 'Released'}</span>
        </div>
      </div>
    </section>

    <section class="demo-section">
      <h2>Space Bar Demo</h2>
      <div class="space-indicator" class:active={isSpaceHeld.held}>
        {isSpaceHeld.held ? '🚀 SPACE HELD!' : 'Hold Space Bar'}
      </div>
    </section>

    <section class="demo-section">
      <h2>Usage</h2>
      <pre
        class="code-block">{`import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'

const isShiftHeld = getIsKeyHeld('Shift')

// In template:
// <div style="opacity: isShiftHeld.held ? 1 : 0.5">
//   {isShiftHeld.held ? 'Shift is pressed!' : 'Press Shift'}
// </div>`}</pre>
    </section>

    <section class="demo-section">
      <h2>Conditional UI Example</h2>
      <p>
        Hold <kbd>Shift</kbd> to reveal the secret message:
      </p>
      <div class="secret-box" class:revealed={isShiftHeld.held}>
        {#if isShiftHeld.held}
          <span>🎉 The secret password is: tanstack-hotkeys-rocks!</span>
        {:else}
          <span>••••••••••••••••••••••••••</span>
        {/if}
      </div>
    </section>

    <section class="demo-section">
      <h2>Use Cases</h2>
      <ul>
        <li>Show different UI based on modifier state</li>
        <li>Enable "power user" mode while holding a key</li>
        <li>Hold-to-reveal sensitive information</li>
        <li>Drag-and-drop with modifier behaviors</li>
        <li>Show additional options on hover + modifier</li>
      </ul>
    </section>
  </main>
</div>
