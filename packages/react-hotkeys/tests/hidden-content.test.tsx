// @vitest-environment happy-dom

import { HotkeyManager } from '@tanstack/hotkeys'
import { act, cleanup, render } from '@testing-library/react'
import React, { StrictMode, Suspense, useRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useHotkey } from '../src/useHotkey'

function pressMod(key: string) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      code: `Key${key.toUpperCase()}`,
      metaKey: true,
      bubbles: true,
      cancelable: true,
    }),
  )
}

describe('hotkeys inside hidden content', () => {
  beforeEach(() => HotkeyManager.resetInstance())
  afterEach(() => {
    cleanup()
    HotkeyManager.resetInstance()
  })

  // React attaches an ancestor's ref after its children's layout effects.
  // React attaches an ancestor's ref after its children's layout effects,
  // so the hotkey registers once the commit has attached it.
  function pressPanel(panel: HTMLElement) {
    panel.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        code: 'KeyS',
        metaKey: true,
        bubbles: true,
        cancelable: true,
      }),
    )
  }
  function Child({
    target,
    fired,
  }: {
    target: React.RefObject<HTMLDivElement | null>
    fired: Array<string>
  }) {
    useHotkey('Mod+S', () => fired.push('save'), { platform: 'mac', target })
    return null
  }
  function Panel({ fired }: { fired: Array<string> }) {
    const ref = useRef<HTMLDivElement>(null)
    return (
      <div ref={ref} tabIndex={0} data-testid="panel">
        <Child target={ref} fired={fired} />
      </div>
    )
  }

  it('registers a hotkey whose target is a ref on an ancestor element', async () => {
    const fired: Array<string> = []
    const { getByTestId } = render(<Panel fired={fired} />)
    await Promise.resolve()
    pressPanel(getByTestId('panel'))
    expect(fired).toEqual(['save'])
  })

  it('reports a conflict found on the retry to the error boundary', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    class Boundary extends React.Component<
      { children: React.ReactNode },
      { failed: boolean }
    > {
      state = { failed: false }
      static getDerivedStateFromError() {
        return { failed: true }
      }
      render() {
        return this.state.failed ? (
          <p data-testid="failed">failed</p>
        ) : (
          this.props.children
        )
      }
    }
    function Strict({
      target,
    }: {
      target: React.RefObject<HTMLDivElement | null>
    }) {
      useHotkey('Mod+S', () => {}, {
        platform: 'mac',
        target,
        conflictBehavior: 'error',
      })
      return null
    }
    function Conflicting() {
      const ref = useRef<HTMLDivElement>(null)
      return (
        <div ref={ref}>
          <Strict target={ref} />
          <Strict target={ref} />
        </div>
      )
    }
    const view = render(
      <Boundary>
        <Conflicting />
      </Boundary>,
    )
    await act(async () => {
      await Promise.resolve()
    })
    expect(view.queryByTestId('failed')).not.toBeNull()
    vi.restoreAllMocks()
  })

  it('registers it again when Suspense shows the unchanged content again', async () => {
    const fired: Array<string> = []
    const never = new Promise<void>(() => {})
    let suspend!: (on: boolean) => void
    function Suspender() {
      const [on, setOn] = useState(false)
      suspend = setOn
      if (on) throw never
      return null
    }
    const view = render(
      <Suspense fallback={<p>loading</p>}>
        <Panel fired={fired} />
        <Suspender />
      </Suspense>,
    )
    await Promise.resolve()
    act(() => suspend(true))
    act(() => suspend(false))
    await Promise.resolve()
    pressPanel(view.getByTestId('panel'))
    expect(fired).toEqual(['save'])
  })

  it.each([false, true])(
    'stops while shown content suspends again behind a fallback (StrictMode %s)',
    (strict) => {
      const fired: Array<string> = []
      const never = new Promise<void>(() => {})
      let suspend!: (on: boolean) => void
      function Suspender() {
        const [on, setOn] = useState(false)
        suspend = setOn
        if (on) throw never
        return null
      }
      function Bind() {
        useHotkey('Mod+S', () => fired.push('save'), { platform: 'mac' })
        return <p>content</p>
      }
      const tree = (
        <Suspense fallback={<p data-testid="fallback">loading</p>}>
          <Bind />
          <Suspender />
        </Suspense>
      )
      const view = render(strict ? <StrictMode>{tree}</StrictMode> : tree)

      act(() => pressMod('s'))
      expect(fired).toEqual(['save'])

      act(() => suspend(true))
      expect(view.queryByTestId('fallback')).not.toBeNull()
      act(() => pressMod('s'))
      expect(fired).toEqual(['save'])
      expect(HotkeyManager.getInstance().getRegistrationCount()).toBe(0)

      act(() => suspend(false))
      expect(view.queryByTestId('fallback')).toBeNull()
      act(() => pressMod('s'))
      expect(fired).toEqual(['save', 'save'])
    },
  )

  it('releases an exclusive scope while its content is hidden', () => {
    const fired: Array<string> = []
    const never = new Promise<void>(() => {})
    let suspend!: (on: boolean) => void
    function Suspender() {
      const [on, setOn] = useState(false)
      suspend = setOn
      if (on) throw never
      return null
    }
    function Page() {
      useHotkey('Mod+K', () => fired.push('page'), { platform: 'mac' })
      return null
    }
    render(
      <>
        <Page />
        <Suspense fallback={<p>loading</p>}>
          <HotkeysProvider scope="dialog" exclusive>
            <p>dialog</p>
          </HotkeysProvider>
          <Suspender />
        </Suspense>
      </>,
    )

    act(() => pressMod('k'))
    expect(fired).toEqual([])

    act(() => suspend(true))
    act(() => pressMod('k'))
    expect(fired).toEqual(['page'])

    act(() => suspend(false))
    act(() => pressMod('k'))
    expect(fired).toEqual(['page'])
  })
})
