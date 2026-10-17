export interface ScopesControls {
  open: boolean
  enabled: boolean
  allow: Array<string> | null
  fired: Record<string, number>
}

export function createScopesControls(): ScopesControls {
  const controls: ScopesControls = $state({
    open: false,
    enabled: true,
    allow: null,
    fired: {},
  })
  return controls
}
