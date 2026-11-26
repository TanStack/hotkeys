// @vitest-environment happy-dom

import { HotkeyManager } from '@tanstack/hotkeys'
import { act, cleanup, render } from '@testing-library/react'
import React, { StrictMode, Suspense, useRef, useState } from 'react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
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
  it('registers a hotkey whose target is a ref on an ancestor element', () => {
    const fired: Array<string> = []
    function Child({
      target,
    }: {
      target: React.RefObject<HTMLDivElement | null>
    }) {
      useHotkey('Mod+S', () => fired.push('save'), { platform: 'mac', target })
      return null
    }
    function Panel() {
      const ref = useRef<HTMLDivElement>(null)
      return (
        <div ref={ref} tabIndex={0} data-testid="panel">
          <Child target={ref} />
        </div>
      )
    }
    const { getByTestId } = render(<Panel />)
    getByTestId('panel').dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 's',
        code: 'KeyS',
        metaKey: true,
        bubbles: true,
        cancelable: true,
      }),
    )
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
