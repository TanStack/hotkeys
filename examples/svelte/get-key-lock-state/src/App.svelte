<script lang="ts">
  import { getKeyLockState } from '@tanstack/svelte-hotkeys'

  const capsLock = getKeyLockState('CapsLock')
  const numLock = getKeyLockState('NumLock')
  const scrollLock = getKeyLockState('ScrollLock')

  const locks = [
    { name: 'Caps Lock', state: capsLock },
    { name: 'Num Lock', state: numLock },
    { name: 'Scroll Lock', state: scrollLock },
  ]

  function describe(state: boolean | null) {
    if (state === null) return 'Unknown'
    return state ? 'On' : 'Off'
  }
</script>

<div class="app">
  <h1>getKeyLockState</h1>

  <div class="field">
    <label for="password">Password</label>
    <input id="password" type="password" />
    <p role="status" class="warning">
      {capsLock.value === true ? 'Caps Lock is on' : ''}
    </p>
  </div>

  <div class="locks">
    {#each locks as lock (lock.name)}
      <div class="lock" class:on={lock.state.value === true}>
        <span class="lock-name">{lock.name}</span>
        <span>{describe(lock.state.value)}</span>
      </div>
    {/each}
  </div>

  <p class="note">
    Unknown until you press a key, click, or move the mouse. Num Lock and Scroll
    Lock stay unknown on macOS.
  </p>
</div>
