import { HotkeyManager, getKeyboardLayoutStore } from '@tanstack/hotkeys'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createSSRApp,
  defineComponent,
  effectScope,
  h,
  nextTick,
  onMounted,
  ref,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import { HotkeysProvider } from '../src/HotkeysProvider'
import { provideHotkeysContext } from '../src/HotkeysProviderContext'
import { useFormatForDisplay } from '../src/useFormatForDisplay'
import { useKeyboardLayout } from '../src/useKeyboardLayout'
import type { App as VueApp, Component, VNodeChild } from 'vue'

const AZERTY = new Map([['KeyQ', 'a']])
// The French BÉPO layout types `b` on this key
const BEPO = new Map([['KeyQ', 'b']])

const Label = defineComponent({
  setup() {
    const format = useFormatForDisplay()
    return () => h('kbd', format('Mod+[KeyQ]'))
  },
})

function app(
  children: () => VNodeChild = () => h(Label),
  keyboardLayout?: boolean,
): Component {
  return {
    render: () =>
      h(
        HotkeysProvider,
        { defaultOptions: { platform: 'windows', keyboardLayout } },
        children,
      ),
  }
}

/** Stubs `navigator.keyboard.getLayoutMap` and returns the mock. */
function stubLayout(result: () => Promise<Map<string, string>>) {
  const getLayoutMap = vi.fn(result)
  vi.stubGlobal('navigator', { ...navigator, keyboard: { getLayoutMap } })
  return getLayoutMap
}

const mounted: Array<{ unmount: () => void }> = []

function render(component: Component) {
  const wrapper = mount(component)
  mounted.push(wrapper)
  return wrapper
}

afterEach(() => {
  for (const wrapper of mounted.splice(0)) wrapper.unmount()
  // The layout outlives the components that loaded it
  getKeyboardLayoutStore().setState(() => null)
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  HotkeyManager.resetInstance()
  document.body.innerHTML = ''
})

describe('keyboard layout labels', () => {
  it('does not render a label again when it names no physical key', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    let renders = 0
    const Logical = defineComponent({
      setup() {
        const format = useFormatForDisplay()
        return () => {
          renders++
          return h('kbd', format('Mod+Q'))
        }
      },
    })
    const wrapper = render(app(() => [h(Logical), h(Label)]))
    await flushPromises()
    // The physical label followed the layout; the other one never ran again
    expect(wrapper.text()).toBe('Ctrl+QCtrl+A')
    expect(renders).toBe(1)
  })

  it('labels a physical key with what it types once the layout loads', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const wrapper = render(app())
    expect(wrapper.text()).toBe('Ctrl+Q')
    await flushPromises()
    expect(wrapper.text()).toBe('Ctrl+A')
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('loads the layout without a provider', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const wrapper = render(
      defineComponent({
        setup() {
          const format = useFormatForDisplay()
          return () => h('kbd', format('[KeyQ]'))
        },
      }),
    )
    await flushPromises()
    expect(wrapper.text()).toBe('A')
  })

  it('reads the layout once for many labels', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const wrapper = render(app(() => [h(Label), h(Label), h(Label)]))
    await flushPromises()
    expect(wrapper.text()).toBe('Ctrl+ACtrl+ACtrl+A')
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('never asks the browser when keyboardLayout is false', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    // Another part of the page may have loaded the layout already
    getKeyboardLayoutStore().setState(() => AZERTY)
    const seen: Array<unknown> = []
    const Reader = defineComponent({
      setup() {
        const layoutMap = useKeyboardLayout()
        return () => {
          seen.push(layoutMap.value)
          return null
        }
      },
    })
    const wrapper = render(app(() => [h(Label), h(Reader)], false))
    await flushPromises()
    expect(getLayoutMap).not.toHaveBeenCalled()
    expect(wrapper.text()).toBe('Ctrl+Q')
    expect(seen).toEqual([null])
  })

  it('lets a nested provider turn the layout back on', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const wrapper = render(
      app(
        () =>
          h(HotkeysProvider, { defaultOptions: { keyboardLayout: true } }, () =>
            h(Label),
          ),
        false,
      ),
    )
    await flushPromises()
    expect(wrapper.text()).toBe('Ctrl+A')
  })

  it('follows the provider when keyboardLayout changes', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const keyboardLayout = ref(false)
    const wrapper = render({
      render: () =>
        h(
          HotkeysProvider,
          {
            defaultOptions: {
              platform: 'windows',
              keyboardLayout: keyboardLayout.value,
            },
          },
          () => h(Label),
        ),
    })
    await flushPromises()
    expect(getLayoutMap).not.toHaveBeenCalled()

    keyboardLayout.value = true
    await flushPromises()
    expect(wrapper.text()).toBe('Ctrl+A')

    keyboardLayout.value = false
    await flushPromises()
    expect(wrapper.text()).toBe('Ctrl+Q')
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('hydrates with the server label, then shows the layout label', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const warnings = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
    const html = await renderToString(createSSRApp(app()))
    expect(html).toContain('Ctrl+Q')
    expect(getLayoutMap).not.toHaveBeenCalled()

    const hydrate = (): { container: HTMLElement; root: VueApp } => {
      const container = document.createElement('div')
      container.innerHTML = html
      document.body.append(container)
      const root = createSSRApp(app())
      root.mount(container)
      mounted.push(root)
      return { container, root }
    }
    const first = hydrate()
    expect(first.container.textContent).toBe('Ctrl+Q')
    await flushPromises()
    expect(first.container.textContent).toBe('Ctrl+A')

    // A root that hydrates after the layout loaded still starts from the
    // server label, so its HTML matches.
    const late = hydrate()
    expect(late.container.textContent).toBe('Ctrl+Q')
    await flushPromises()
    expect(late.container.textContent).toBe('Ctrl+A')
    expect(warnings).not.toHaveBeenCalled()
    expect(errors).not.toHaveBeenCalled()
  })

  it('shows the loaded layout to a label that mounts later, without another read', async () => {
    const getLayoutMap = stubLayout(() => new Promise(() => {}))
    getKeyboardLayoutStore().setState(() => AZERTY)
    // Such as a tooltip that opens again. The label starts from the
    // conventional text, as a hydrating one must, and updates when it mounts.
    const wrapper = render(app())
    await nextTick()
    expect(wrapper.text()).toBe('Ctrl+A')
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('shows the loaded layout at once to a label that a mounted app adds', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const show = ref(false)
    const wrapper = render(app(() => [h(Label), show.value ? h(Label) : null]))
    await flushPromises()
    show.value = true
    await nextTick()
    expect(wrapper.text()).toBe('Ctrl+ACtrl+A')
  })

  it('follows a layout change when the window regains focus', async () => {
    let layout = AZERTY
    stubLayout(() => Promise.resolve(layout))
    const wrapper = render(app())
    await flushPromises()
    expect(wrapper.text()).toBe('Ctrl+A')
    layout = BEPO
    window.dispatchEvent(new Event('focus'))
    await flushPromises()
    expect(wrapper.text()).toBe('Ctrl+B')
  })

  it('stops reading the layout on focus once no label is mounted', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const wrapper = render(app())
    await flushPromises()
    wrapper.unmount()
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
  })

  it('keeps conventional labels where the browser reports no layout', async () => {
    vi.stubGlobal('navigator', { ...navigator, keyboard: undefined })
    const wrapper = render(app())
    await flushPromises()
    expect(wrapper.text()).toBe('Ctrl+Q')
  })

  it('lets a layoutMap passed to format win over the loaded layout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const wrapper = render(
      defineComponent({
        setup() {
          const format = useFormatForDisplay()
          return () =>
            h('kbd', format('[KeyQ]', { layoutMap: new Map([['KeyQ', 'x']]) }))
        },
      }),
    )
    await flushPromises()
    expect(wrapper.text()).toBe('X')
  })

  it('returns the layout from useKeyboardLayout', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    const seen: Array<string | undefined> = []
    render(
      defineComponent({
        setup() {
          const layoutMap = useKeyboardLayout()
          return () => {
            seen.push(layoutMap.value?.get('KeyQ'))
            return null
          }
        },
      }),
    )
    await flushPromises()
    expect(seen).toEqual([undefined, 'a'])
  })

  it('loads the layout in an effect scope outside a component', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const warnings = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const scope = effectScope()
    const layoutMap = scope.run(() => useKeyboardLayout())!
    expect(layoutMap.value).toBeNull()
    await flushPromises()
    expect(layoutMap.value?.get('KeyQ')).toBe('a')

    // The ref follows the store until its scope stops
    scope.stop()
    getKeyboardLayoutStore().setState(() => BEPO)
    expect(layoutMap.value?.get('KeyQ')).toBe('a')
    window.dispatchEvent(new Event('focus'))
    expect(getLayoutMap).toHaveBeenCalledOnce()
    expect(warnings).not.toHaveBeenCalled()
  })

  it('reads the layout right away in a component that has mounted', async () => {
    stubLayout(() => Promise.resolve(AZERTY))
    getKeyboardLayoutStore().setState(() => AZERTY)
    let layoutMap!: ReturnType<typeof useKeyboardLayout>
    render(
      defineComponent({
        setup() {
          onMounted(() => {
            layoutMap = useKeyboardLayout()
          })
          return () => null
        },
      }),
    )
    expect(layoutMap.value?.get('KeyQ')).toBe('a')
  })

  it('reads the off switch from provideHotkeysContext', async () => {
    const getLayoutMap = stubLayout(() => Promise.resolve(AZERTY))
    const wrapper = render(
      defineComponent({
        setup() {
          provideHotkeysContext({
            defaultOptions: { platform: 'windows', keyboardLayout: false },
          })
          return () => h(Label)
        },
      }),
    )
    await flushPromises()
    expect(getLayoutMap).not.toHaveBeenCalled()
    expect(wrapper.text()).toBe('Ctrl+Q')
  })
})
