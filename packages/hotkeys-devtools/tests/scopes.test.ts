import { describe, expect, it } from 'vitest'
import { getScopeStatus, groupByScope } from '../src/_scopes'
import type { HotkeyRegistrationView } from '@tanstack/hotkeys'

function registration(id: string, scope?: string): HotkeyRegistrationView {
  return { id, options: { scope } } as HotkeyRegistrationView
}

describe('devtools scopes', () => {
  const registrations = [
    registration('a'),
    registration('b', 'editor'),
    registration('c', 'dialog'),
    registration('d', 'unmounted'),
    registration('e', 'editor'),
  ]

  it('orders groups by precedence, then inactive scopes', () => {
    const groups = groupByScope(registrations, {
      active: ['editor', 'dialog'],
      exclusive: null,
      allowed: [],
      suspended: [],
    })
    expect(
      groups.map((g) => [g.scope, g.status, g.registrations.length]),
    ).toEqual([
      ['dialog', 'active', 1],
      ['editor', 'active', 2],
      ['global', 'active', 1],
      ['unmounted', 'inactive', 1],
    ])
  })

  it('puts the exclusive scope first and suspends the rest', () => {
    const state = {
      active: ['editor', 'dialog'],
      exclusive: 'dialog',
      allowed: [],
      suspended: ['global', 'editor'],
    }
    expect(groupByScope(registrations, state).map((g) => g.status)).toEqual([
      'exclusive',
      'suspended',
      'suspended',
      'inactive',
    ])
    expect(getScopeStatus('global', state)).toBe('suspended')
  })

  it('marks scopes the exclusive scope allows', () => {
    const state = {
      active: ['editor', 'dialog'],
      exclusive: 'dialog',
      allowed: ['global'],
      suspended: ['editor'],
    }
    expect(
      groupByScope(registrations, state).map((g) => [g.scope, g.status]),
    ).toEqual([
      ['dialog', 'exclusive'],
      ['editor', 'suspended'],
      ['global', 'allowed'],
      ['unmounted', 'inactive'],
    ])
  })
})
