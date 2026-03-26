import { formatForDisplay } from '@tanstack/hotkeys'
import type { Hotkey } from '@tanstack/hotkeys'

type Platform = 'mac' | 'windows' | 'linux'

/** Chords to demo; later rows use special-key display symbols (arrows, Enter, Tab, Space, etc.). */
const SHORTCUTS: Array<Hotkey> = [
  'Mod+S',
  'Mod+Shift+Z',
  'Mod+Shift+4',
  'Control+Alt+D',
  'Mod+Shift+N',
  'Control+Shift+I',
  'Control+Alt+Shift+Escape',
  'Control+Alt+Shift+A',
  'Mod+Alt+Shift+K',
  'Alt+Shift+T',
  'Mod+Alt+`',
  'Control+Meta+F',
  'Mod+ArrowUp',
  'Shift+ArrowDown',
  'Alt+ArrowLeft',
  'Control+ArrowRight',
  'Mod+Enter',
  'Shift+Enter',
  'Mod+Tab',
  'Control+Tab',
  'Mod+Space',
  'Mod+Backspace',
  'Shift+Delete',
  'Mod+Escape',
  'Escape',
  '-',
  'Alt+.',
]

function getStoredPlatform(): Platform {
  const raw = localStorage.getItem('hotkeys-demo-platform')
  if (raw === 'mac' || raw === 'windows' || raw === 'linux') return raw
  return 'mac'
}

function mount(root: HTMLElement) {
  let platform: Platform = getStoredPlatform()

  root.innerHTML = `
    <h1>formatForDisplay</h1>
    <p class="lead">
      Mock the viewer's OS to see how the same chord string is shown in the UI.
      Two columns both use <code>formatForDisplay</code> with
      <code>useSymbols: true</code> vs <code>useSymbols: false</code>.
      Uses <code>@tanstack/hotkeys</code> only (no framework).
    </p>
    <fieldset>
      <legend>Display platform</legend>
      <div class="platform-options" id="platform-radios"></div>
    </fieldset>
    <table>
      <thead>
        <tr>
          <th>Raw</th>
          <th><code>formatForDisplay</code> (<code>useSymbols: true</code>)</th>
          <th><code>formatForDisplay</code> (<code>useSymbols: false</code>)</th>
        </tr>
      </thead>
      <tbody id="shortcut-rows"></tbody>
    </table>
  `

  const radiosHost = root.querySelector('#platform-radios')!
  const tbody = root.querySelector('#shortcut-rows')!

  const platforms: Array<{ value: Platform; label: string }> = [
    { value: 'mac', label: 'macOS' },
    { value: 'windows', label: 'Windows' },
    { value: 'linux', label: 'Linux' },
  ]

  for (const { value, label } of platforms) {
    const id = `platform-${value}`
    const wrap = document.createElement('label')
    wrap.innerHTML = `
      <input type="radio" name="platform" id="${id}" value="${value}" ${
        platform === value ? 'checked' : ''
      } />
      <span>${label}</span>
    `
    radiosHost.appendChild(wrap)
  }

  function renderRows() {
    tbody.replaceChildren()
    for (const hotkey of SHORTCUTS) {
      const tr = document.createElement('tr')
      const withSymbols = formatForDisplay(hotkey, {
        platform,
        useSymbols: true,
      })
      const withLabels = formatForDisplay(hotkey, {
        platform,
        useSymbols: false,
      })
      tr.innerHTML = `
        <td class="mono">${escapeHtml(hotkey)}</td>
        <td class="mono display">${escapeHtml(withSymbols)}</td>
        <td class="mono display-labels">${escapeHtml(withLabels)}</td>
      `
      tbody.appendChild(tr)
    }
  }

  radiosHost.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement
    if (t.name !== 'platform' || t.type !== 'radio') return
    const v = t.value
    if (v !== 'mac' && v !== 'windows' && v !== 'linux') return
    platform = v
    localStorage.setItem('hotkeys-demo-platform', platform)
    renderRows()
  })

  renderRows()
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const app = document.getElementById('app')
if (app) mount(app)
