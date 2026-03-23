import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js'
import { Header, HeaderLogo, MainPanel } from '@tanstack/devtools-ui'
import { useStyles } from '../styles/use-styles'
import { useHotkeysDevtoolsState } from '../HotkeysContextProvider'
import { HeldKeysBar } from './HeldKeysTopbar'
import { HotkeyList } from './HotkeyList'
import { DetailsPanel } from './DetailsPanel'

function readResizeObserverBlockSize(entry: ResizeObserverEntry): number {
  const [box] = entry.borderBoxSize
  if (box !== undefined) return box.blockSize
  return entry.contentRect.height
}

/** TanStack devtools plugin pane; percentage heights break without this. */
function resolvePluginHost(el: HTMLElement): HTMLElement | null {
  const found = el.closest('[id^="plugin-container-"]')
  if (found instanceof HTMLElement) return found
  let n: HTMLElement | null = el
  for (let i = 0; i < 3 && n; i++) {
    n = n.parentElement
  }
  return n
}

export function Shell() {
  const styles = useStyles()
  const state = useHotkeysDevtoolsState()
  const [selectedId, setSelectedId] = createSignal<string | null>(null)
  const [leftPanelWidth, setLeftPanelWidth] = createSignal(300)
  const [isDragging, setIsDragging] = createSignal(false)
  const [shellRootEl, setShellRootEl] = createSignal<HTMLElement | null>(null)
  const [slotHeightPx, setSlotHeightPx] = createSignal<number | undefined>(
    undefined,
  )

  const selectedRegistration = createMemo(() => {
    const id = selectedId()
    if (!id) return null
    const hotkey = state.registrations().find((r) => r.id === id)
    if (hotkey) return hotkey
    const sequence = state.sequenceRegistrations().find((r) => r.id === id)
    return sequence ?? null
  })

  let dragStartX = 0
  let dragStartWidth = 0

  const handleMouseDown = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    dragStartX = e.clientX
    dragStartWidth = leftPanelWidth()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return

    e.preventDefault()
    const deltaX = e.clientX - dragStartX
    const newWidth = Math.max(150, Math.min(800, dragStartWidth + deltaX))
    setLeftPanelWidth(newWidth)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  onMount(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  })

  onCleanup(() => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  })

  createEffect(() => {
    const el = shellRootEl()
    if (!el || typeof ResizeObserver === 'undefined') return
    const pluginHost = resolvePluginHost(el)
    if (!pluginHost) return

    const applyHeight = (entry?: ResizeObserverEntry) => {
      const clientH = pluginHost.clientHeight
      const fromObserver =
        entry !== undefined ? readResizeObserverBlockSize(entry) : 0
      const h = clientH > 0 ? clientH : fromObserver
      if (h > 0) setSlotHeightPx(Math.round(h))
    }

    applyHeight()
    const ro = new ResizeObserver((entries) => {
      applyHeight(entries[0])
    })
    ro.observe(pluginHost)
    onCleanup(() => ro.disconnect())
  })

  return (
    <div
      ref={(el) => setShellRootEl(el)}
      class={styles().shellRoot}
      style={{
        ...(slotHeightPx() !== undefined
          ? {
              height: `${slotHeightPx()}px`,
              'max-height': `${slotHeightPx()}px`,
            }
          : {}),
      }}
    >
      <MainPanel class={styles().mainPanelShell}>
        <Header>
          <HeaderLogo
            flavor={{
              light: 'oklch(51.4% 0.222 16.935)',
              dark: 'oklch(58.6% 0.253 17.585)',
            }}
          >
            TanStack Hotkeys
          </HeaderLogo>
        </Header>

        <div class={styles().mainContainer}>
          <HeldKeysBar />

          <div class={styles().panelsContainer}>
            <div
              class={styles().leftPanel}
              style={{
                width: `${leftPanelWidth()}px`,
                'min-width': '150px',
                'max-width': '800px',
              }}
            >
              <div class={styles().leftPanelScroll}>
                <HotkeyList
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                />
              </div>
            </div>

            <div
              class={`${styles().dragHandle} ${isDragging() ? 'dragging' : ''}`}
              onMouseDown={handleMouseDown}
            />

            <div class={styles().rightPanel} style={{ flex: 1 }}>
              <div class={styles().panelHeader}>Details</div>
              <DetailsPanel selectedRegistration={selectedRegistration} />
            </div>
          </div>
        </div>
      </MainPanel>
    </div>
  )
}
