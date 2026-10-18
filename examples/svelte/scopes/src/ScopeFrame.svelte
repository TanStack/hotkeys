<script lang="ts">
  /** The box alone, for content rendered apart from its provider, such as a dialog. */
  import type { Snippet } from 'svelte'
  import type { ExclusiveOption } from './activity.svelte'

  let {
    scope = 'global',
    exclusive,
    enabled,
    children,
  }: {
    scope?: string
    exclusive?: ExclusiveOption
    enabled?: boolean
    children: Snippet
  } = $props()

  const label = $derived.by(() => {
    const attributes = [
      scope !== 'global' && `scope="${scope}"`,
      exclusive &&
        `exclusive${exclusive === true ? '' : `={{ allow: [${exclusive.allow.map((s) => `'${s}'`).join(', ')}] }}`}`,
      enabled !== undefined && `enabled={${enabled}}`,
    ].filter(Boolean)
    return `<HotkeysProvider${attributes.map((a) => ` ${a}`).join('')}>`
  })
</script>

<fieldset
  class="scope-frame"
  data-exclusive={!!exclusive}
  data-enabled={enabled !== false}
>
  <legend><code>{label}</code></legend>
  {@render children()}
</fieldset>
