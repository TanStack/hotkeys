<script lang="ts">
  import { formatForDisplay } from '@tanstack/svelte-hotkeys'
  let platform = $state<'mac' | 'windows' | 'linux'>('mac'),
    modifiers = $state(false),
    keys = $state(true)
  const options = $derived.by(() => ({
    platform: platform,
    useSymbols: { modifiers: modifiers, keys: keys },
  }))
  const bindings = [
    'Mod+Shift+ArrowUp',
    'Control++',
    'Alt+[KeyS]',
    'Mod+[NumpadAdd]',
  ] as const
</script>

<section>
  <h2>Formatting</h2>
  <label
    >Platform <select bind:value={platform}
      ><option value="mac">macOS</option><option value="windows">Windows</option
      ><option value="linux">Linux</option></select
    ></label
  ><label
    ><input type="checkbox" bind:checked={modifiers} /> Modifier symbols</label
  ><label><input type="checkbox" bind:checked={keys} /> Key symbols</label>
  <table>
    <thead><tr><th>Binding</th><th>String</th><th>Parts</th></tr></thead><tbody
      >{#each bindings as binding}<tr
          ><td><code>{binding}</code></td><td
            >{formatForDisplay(binding, options)}</td
          ><td
            >{#each formatForDisplay( binding, { ...options, parts: true }, ) as part}<kbd
                >{part}</kbd
              >{/each}</td
          ></tr
        >{/each}</tbody
    >
  </table>
  <p>
    Supply layoutMap or keyLabels for layout labels. Formatting never changes
    binding identity.
  </p>
</section>
