import {
  formatForDisplay,
  parseHotkey,
  validateHotkey,
} from '@tanstack/hotkeys'
import type {
  FormatDisplayOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

const app = document.getElementById('app')!
app.innerHTML = `
  <header><p class="eyebrow">TANSTACK HOTKEYS · VANILLA</p><h1>A shortcut, in every style.</h1>
  <p class="lead">Explore <code>formatForDisplay</code>: platform labels, independent symbols, custom separators, and individual keycaps. Display never changes a binding’s identity.</p></header>
  <main><section class="playground"><div class="controls">
    <h2>Try a binding</h2>
    <label>Hotkey string <input id="binding" value="Mod+Shift+ArrowUp" spellcheck="false"></label>
    <label>Platform <select id="platform"><option value="auto">Detect automatically</option><option value="mac">macOS</option><option value="windows">Windows</option><option value="linux">Linux</option></select></label>
    <label>Symbols <select id="symbols"><option value="default">Default (true)</option><option value="true">true — all symbols</option><option value="false">false — all labels</option><option value="keys">Keys only</option><option value="modifiers">Modifiers only</option><option value="partial">{ modifiers: false } — keys default to true</option></select></label>
    <label>Separator <select id="separator"><option value="default">Platform default (undefined)</option><option value="null">Platform default (null)</option><option value="empty">No separator</option><option value="custom">Custom</option></select></label>
    <label id="custom-label" hidden>Custom separator <input id="custom" value=" · "></label>
    <label class="check"><input id="layout" type="checkbox"> Supply a sample layoutMap (KeyQ → a, KeyS → o)</label>
    <label class="check"><input id="labels" type="checkbox"> Supply explicit keyLabels</label>
    <p class="note">Demo labels: KeyS → S, KeyQ → A, NumpadAdd → Numpad +, ArrowUp → Up. These are supplied labels, not inferred keyboard layouts.</p>
  </div><div class="preview" aria-live="polite"><p class="eyebrow">STRING OUTPUT</p><output id="string-output"></output><p class="eyebrow">PARTS AS KEYCAPS</p><div id="keycaps"></div><pre id="parts-output"></pre><p id="error" role="status"></p><pre id="snippet"></pre></div></section>
  <section><h2>Compare symbol settings</h2><p>All columns use your selected platform and separator. Keys and modifiers can be styled independently.</p><div class="table-scroll"><table><thead><tr><th>Binding</th><th>Default / true</th><th>Labels / false</th><th>Modifier symbols</th><th>Key symbols</th><th>parts: true</th></tr></thead><tbody id="comparisons"></tbody></table></div></section>
  <section><h2>Every input form</h2><p>Strings, raw logical objects, raw physical objects, and parsed bindings share the same formatter.</p><div class="input-grid" id="inputs"></div></section>
  <footer>Physical tokens such as <code>[KeyQ]</code> display a conventional letter label by default. Supply an already-resolved <code>layoutMap</code> for layout labels, or <code>keyLabels</code> for explicit overrides. The formatter never loads a layout map. <code>parts: true</code> returns an array and ignores the separator; a runtime boolean returns <code>string | string[]</code>.</footer></main>
`
// Typed lookups for the static playground controls created above.
const input = (id: string) => document.getElementById(id) as HTMLInputElement
const select = (id: string) => document.getElementById(id) as HTMLSelectElement
const element = (id: string) => document.getElementById(id)!
const samples = [
  'Mod+S',
  'Mod+Shift+ArrowUp',
  'Shift+ArrowDown',
  'Alt+ArrowLeft',
  'Control+ArrowRight',
  'Mod+Enter',
  'Mod+Tab',
  'Mod+Space',
  'Mod+Backspace',
  'Shift+Delete',
  'Escape',
  'Control++',
  'Alt+.',
  'Alt+ß',
  'Alt+[KeyS]',
  'Mod+[Digit2]',
  'Shift+[ArrowUp]',
  'Mod+[Slash]',
  '[NumpadEnter]',
  'Mod+[NumpadAdd]',
]
// A resolved sample map demonstrates layout lookup without calling browser APIs.
const layoutMap = new Map([
  ['KeyQ', 'a'],
  ['KeyS', 'o'],
])
const keyLabels = { KeyS: 'S', KeyQ: 'A', NumpadAdd: 'Numpad +', ArrowUp: 'Up' }
const symbolModes: Record<string, FormatDisplayOptions['useSymbols']> = {
  default: undefined,
  true: true,
  false: false,
  modifiers: { modifiers: true, keys: false },
  keys: { modifiers: false, keys: true },
  partial: { modifiers: false },
}
/** Renders each display part safely as text inside its own keycap. */
function keycaps(host: HTMLElement, parts: Array<string>) {
  host.replaceChildren(
    ...parts.map((part) => {
      const key = document.createElement('kbd')
      key.textContent = part
      return key
    }),
  )
}
/** Appends a text-only comparison cell, including user-supplied separator output. */
function cell(row: HTMLTableRowElement, text: string) {
  const td = row.insertCell()
  td.textContent = text
  return td
}
/** Recomputes previews, comparison rows, and input-form examples from the current controls. */
function render() {
  const platform = select('platform').value
  const separator = select('separator').value
  element('custom-label').hidden = separator !== 'custom'
  const options: FormatDisplayOptions & { parts?: false } = {
    ...(platform === 'auto'
      ? {}
      : { platform: platform as 'mac' | 'windows' | 'linux' }),
    useSymbols: symbolModes[select('symbols').value],
    separatorToken:
      separator === 'null'
        ? null
        : separator === 'empty'
          ? ''
          : separator === 'custom'
            ? input('custom').value
            : undefined,
    ...(input('labels').checked ? { keyLabels } : {}),
    ...(input('layout').checked ? { layoutMap } : {}),
  }
  const hotkey = input('binding').value
  const validation = validateHotkey(hotkey)
  element('error').textContent = validation.valid
    ? ''
    : validation.errors.join(' ')
  element('string-output').textContent = formatForDisplay(hotkey, options)
  const parts = formatForDisplay(hotkey, { ...options, parts: true })
  keycaps(element('keycaps'), parts)
  element('parts-output').textContent = JSON.stringify(parts)
  const optionCode = JSON.stringify(
    options,
    (_, value) => (value === layoutMap ? '__layoutMap__' : value),
    2,
  ).replace('"__layoutMap__"', 'layoutMap')
  element('snippet').textContent =
    (options.layoutMap
      ? `const layoutMap = new Map(${JSON.stringify([...layoutMap])})\n\n`
      : '') +
    `formatForDisplay(${JSON.stringify(hotkey)}, ${optionCode})\n\n// Render one <kbd> per part:\nformatForDisplay(${JSON.stringify(hotkey)}, {\n  ...options, parts: true\n})`
  const tbody = element('comparisons') as HTMLTableSectionElement
  tbody.replaceChildren()
  for (const sample of samples) {
    const row = tbody.insertRow()
    cell(row, sample)
    for (const useSymbols of [
      true,
      false,
      { modifiers: true, keys: false },
      { modifiers: false, keys: true },
    ]) {
      cell(row, formatForDisplay(sample, { ...options, useSymbols }))
    }
    keycaps(
      cell(row, ''),
      formatForDisplay(sample, { ...options, parts: true }),
    )
  }
  const forms: Array<{
    label: string
    code: string
    binding: RegisterableHotkey | ReturnType<typeof parseHotkey>
  }> = [
    {
      label: 'Logical string',
      code: "'Mod+Shift+ArrowUp'",
      binding: 'Mod+Shift+ArrowUp',
    },
    {
      label: 'Raw logical object',
      code: "{ key: 'ArrowUp', mod: true, shift: true }",
      binding: { key: 'ArrowUp', mod: true, shift: true },
    },
    { label: 'Physical string', code: "'Alt+[KeyQ]'", binding: 'Alt+[KeyQ]' },
    {
      label: 'Raw physical object',
      code: "{ code: 'KeyQ', alt: true }",
      binding: { code: 'KeyQ', alt: true },
    },
    {
      label: 'Parsed binding',
      code: "parseHotkey('Mod+Shift+ArrowUp', 'mac')",
      binding: parseHotkey('Mod+Shift+ArrowUp', 'mac'),
    },
    { label: 'Literal plus', code: "'Control++'", binding: 'Control++' },
  ]
  element('inputs').replaceChildren(
    ...forms.map(({ label, code, binding }) => {
      const card = document.createElement('article')
      const title = document.createElement('h3')
      title.textContent = label
      const source = document.createElement('code')
      source.textContent = code
      const result = document.createElement('div')
      result.className = 'form-result'
      keycaps(result, formatForDisplay(binding, { ...options, parts: true }))
      card.append(title, source, result)
      return card
    }),
  )
}
app.addEventListener('input', render)
render()
