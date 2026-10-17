import type {
  HotkeyRegistrationView,
  HotkeyScopesState,
} from '@tanstack/hotkeys'

/**
 * Whether a scope's hotkeys can fire.
 * - `'exclusive'`: the exclusive scope; other scopes fire only if nested in
 *   it or allowed by it
 * - `'allowed'`: activated, and allowed by the exclusive scope
 * - `'active'`: `'global'` or activated, and not suspended
 * - `'suspended'`: activated, but another scope is exclusive
 * - `'inactive'`: not activated, such as a provider that is not mounted
 */
export type ScopeStatus =
  'exclusive' | 'allowed' | 'active' | 'suspended' | 'inactive'

export const scopeStatusDescriptions: Record<ScopeStatus, string> = {
  exclusive:
    'Exclusive: only hotkeys in this scope, scopes nested in it, and scopes it allows fire',
  allowed: 'Allowed: the exclusive scope lets hotkeys in this scope fire',
  active: 'Active: hotkeys in this scope fire',
  suspended: 'Suspended: another scope is exclusive',
  inactive: 'Inactive: nothing has activated this scope',
}

export function getScopeStatus(
  scope: string,
  state: HotkeyScopesState,
): ScopeStatus {
  if (scope === state.exclusive) return 'exclusive'
  if (state.allowed.includes(scope)) return 'allowed'
  if (state.suspended.includes(scope)) return 'suspended'
  return scope === 'global' || state.active.includes(scope)
    ? 'active'
    : 'inactive'
}

export interface ScopeGroup {
  scope: string
  status: ScopeStatus
  registrations: Array<HotkeyRegistrationView>
}

/**
 * Groups registrations by scope, highest precedence first: the exclusive
 * scope, other activated scopes from most to least recent, `'global'`, then
 * inactive scopes by name.
 */
export function groupByScope(
  registrations: ReadonlyArray<HotkeyRegistrationView>,
  state: HotkeyScopesState,
): Array<ScopeGroup> {
  const byScope = new Map<string, Array<HotkeyRegistrationView>>()
  for (const registration of registrations) {
    const scope = registration.options.scope ?? 'global'
    const list = byScope.get(scope)
    if (list) list.push(registration)
    else byScope.set(scope, [registration])
  }
  const rank = (scope: string) => {
    if (scope === state.exclusive) return Infinity
    if (scope === 'global') return 0
    return state.active.indexOf(scope) + 1 || -1
  }
  return [...byScope.keys()]
    .sort((a, b) => rank(b) - rank(a) || a.localeCompare(b))
    .map((scope) => ({
      scope,
      status: getScopeStatus(scope, state),
      registrations: byScope.get(scope)!,
    }))
}
