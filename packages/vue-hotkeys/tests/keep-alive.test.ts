import { KeepAlive, defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { useHotkey } from '../src/useHotkey'
import { useHotkeyRecorder } from '../src/useHotkeyRecorder'
import type { Component, VNodeChild } from 'vue'

function press(key: string) {
  const code = `Key${key.toUpperCase()}`
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, code, bubbles: true }),
  )
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key, code, bubbles: true }),
  )
}

function page(render: () => VNodeChild, setup: () => void = () => {}) {
  return defineComponent({
    setup() {
      setup()
      return render
    },
  })
}

/** A component that runs `setup` and renders nothing. */
function child(setup: () => void) {
  return h(page(() => null, setup))
}

const mounted: Array<{ unmount: () => void }> = []

/** Renders the current page, cached by `<KeepAlive>` unless `cache` is false. */
function mountPages(pages: Record<string, Component>, cache = true) {
  const current = ref(Object.keys(pages)[0]!)
  const wrapper = mount(
    defineComponent({
      setup() {
        return () => {
          const view = h(pages[current.value]!)
          return cache ? h(KeepAlive, null, [view]) : view
        }
      },
    }),
  )
  mounted.push(wrapper)
  const show = async (name: string) => {
    current.value = name
    await nextTick()
  }
  return { show }
}

const scopes = () => getHotkeyManager().scopes.state

describe('<KeepAlive>', () => {
  afterEach(() => {
    mounted.splice(0).forEach((wrapper) => wrapper.unmount())
    HotkeyManager.resetInstance()
  })

  it("stops a cached page's hotkeys while hidden and restores them when shown", async () => {
    const onK = vi.fn()
    const onJ = vi.fn()
    const { show } = mountPages({
      a: page(() => child(() => useHotkey('K', onK))),
      b: page(() => child(() => useHotkey('J', onJ))),
    })
    await nextTick()

    await show('b')
    press('k')
    press('j')
    expect([onK.mock.calls.length, onJ.mock.calls.length]).toEqual([0, 1])
    expect(getHotkeyManager().registrations.state.size).toBe(1)

    await show('a')
    press('k')
    press('j')
    expect([onK.mock.calls.length, onJ.mock.calls.length]).toEqual([1, 1])
  })

  it('releases a cached exclusive scope and restores nested scopes in order', async () => {
    const onEscape = vi.fn()
    const onPanelK = vi.fn()
    const onJ = vi.fn()
    const { show } = mountPages({
      a: page(() =>
        h(
          HotkeysProvider,
          { scope: 'modal', exclusive: true },
          {
            default: () => [
              child(() => useHotkey('Escape', onEscape)),
              h(
                HotkeysProvider,
                { scope: 'panel' },
                { default: () => child(() => useHotkey('K', onPanelK)) },
              ),
            ],
          },
        ),
      ),
      b: page(() => child(() => useHotkey('J', onJ))),
    })
    await nextTick()
    expect(scopes()).toMatchObject({
      active: ['modal', 'panel'],
      exclusive: 'modal',
    })

    await show('b')
    expect(scopes()).toMatchObject({ active: [], exclusive: null })
    press('j')
    expect(onJ).toHaveBeenCalledTimes(1)

    await show('a')
    expect(scopes()).toMatchObject({
      active: ['modal', 'panel'],
      exclusive: 'modal',
    })
    press('k')
    press('j')
    expect([onPanelK.mock.calls.length, onJ.mock.calls.length]).toEqual([1, 1])
  })

  it('stops recording when the page is hidden', async () => {
    let recorder!: ReturnType<typeof useHotkeyRecorder>
    const { show } = mountPages({
      a: page(() =>
        child(() => (recorder = useHotkeyRecorder({ onRecord() {} }))),
      ),
      b: page(() => null),
    })
    await nextTick()
    recorder.startRecording()
    expect(recorder.isRecording.value).toBe(true)

    await show('b')
    expect(recorder.isRecording.value).toBe(false)
  })

  it('keeps hotkeys and scopes of pages outside <KeepAlive> as before', async () => {
    const onK = vi.fn()
    const { show } = mountPages(
      {
        a: page(() =>
          h(
            HotkeysProvider,
            { scope: 'modal', exclusive: true },
            { default: () => child(() => useHotkey('K', onK)) },
          ),
        ),
        b: page(() => null),
      },
      false,
    )
    await nextTick()
    expect(scopes()).toMatchObject({ active: ['modal'], exclusive: 'modal' })
    press('k')
    expect(onK).toHaveBeenCalledTimes(1)

    await show('b')
    expect(scopes()).toMatchObject({ active: [], exclusive: null })
    expect(getHotkeyManager().registrations.state.size).toBe(0)
  })
})
