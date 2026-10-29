import { expect, test } from '../support/fixtures'

const FORM = `
  <input id="text" type="text">
  <textarea id="area"></textarea>
  <div id="editable" contenteditable="true"></div>
  <select id="select"><option>a</option><option>k</option></select>
  <input id="checkbox" type="checkbox">
  <button id="button">Button</button>
  <a id="link" href="#x">Link</a>
  <div id="panel" tabindex="0"><input id="panel-input"></div>
  <div id="other" tabindex="0">Other</div>
`

test.describe('typing in inputs (ignoreInputs: auto)', () => {
  for (const id of ['text', 'area', 'editable']) {
    test(`single keys type into #${id} instead of firing`, async ({
      page,
      harness,
    }) => {
      const hk = await harness(FORM)
      await hk.register('k', 'K')
      await hk.register('shift-k', 'Shift+K')
      await page.focus(`#${id}`)
      await page.keyboard.type('kK')
      expect(await hk.firedNames()).toEqual([])
      const text = await page
        .locator(`#${id}`)
        .evaluate((el) =>
          'value' in el ? (el as HTMLInputElement).value : el.textContent,
        )
      expect(text).toBe('kK')
    })

    test(`Mod shortcuts and Escape still fire in #${id}`, async ({
      page,
      harness,
    }) => {
      const hk = await harness(FORM)
      await hk.register('save', 'Mod+S')
      await hk.register('close', 'Escape')
      await page.focus(`#${id}`)
      await page.keyboard.press(`${hk.mod}+s`)
      await page.keyboard.press('Escape')
      expect(await hk.fired()).toMatchObject([
        { name: 'save', focus: id },
        { name: 'close', focus: id },
      ])
    })
  }

  test('ignoreInputs: false fires single keys in inputs', async ({
    page,
    harness,
  }) => {
    const hk = await harness(FORM)
    await hk.register('k', 'K', { ignoreInputs: false })
    await page.focus('#text')
    await page.keyboard.press('k')
    expect(await hk.firedNames()).toEqual(['k'])
    // preventDefault applies, so nothing is typed.
    await expect(page.locator('#text')).toHaveValue('')
  })

  test('ignoreInputs: true skips Mod shortcuts in inputs', async ({
    page,
    harness,
  }) => {
    const hk = await harness(FORM)
    await hk.register('save', 'Mod+S', { ignoreInputs: true })
    await page.focus('#text')
    await page.keyboard.press(`${hk.mod}+s`)
    await page.focus('#other')
    await page.keyboard.press(`${hk.mod}+s`)
    expect(await hk.fired()).toMatchObject([{ name: 'save', focus: 'other' }])
  })

  test('select keeps its typeahead keys', async ({ page, harness }) => {
    const hk = await harness(FORM)
    await hk.register('k', 'K')
    await page.focus('#select')
    await page.keyboard.press('k')
    expect(await hk.firedNames()).toEqual([])
  })

  test('buttons and links keep Enter; Space on a checkbox toggles it', async ({
    page,
    harness,
  }) => {
    const hk = await harness(FORM)
    await hk.register('enter', 'Enter')
    await hk.register('space', 'Space')
    await page.focus('#button')
    await page.keyboard.press('Enter')
    await page.focus('#link')
    await page.keyboard.press('Enter')
    await page.focus('#checkbox')
    await page.keyboard.press('Space')
    await expect(page.locator('#checkbox')).toBeChecked()
    await page.focus('#other')
    await page.keyboard.press('Enter')
    expect(await hk.fired()).toMatchObject([{ name: 'enter', focus: 'other' }])
  })
})

test.describe('targets', () => {
  test('an element target fires only with focus inside it', async ({
    page,
    harness,
  }) => {
    const hk = await harness(FORM)
    await hk.register('panel', 'Mod+K', { target: '#panel' })
    await page.focus('#other')
    await page.keyboard.press(`${hk.mod}+k`)
    await page.focus('#panel')
    await page.keyboard.press(`${hk.mod}+k`)
    await page.focus('#panel-input')
    await page.keyboard.press(`${hk.mod}+k`)
    expect(await hk.fired()).toMatchObject([
      { name: 'panel', focus: 'panel' },
      { name: 'panel', focus: 'panel-input' },
    ])
  })

  test('a hotkey targeted at an input receives keys typed in it', async ({
    page,
    harness,
  }) => {
    const hk = await harness(FORM)
    await hk.register('submit', 'Enter', { target: '#text' })
    await hk.register('global-enter', 'Enter')
    await page.focus('#text')
    await page.keyboard.press('Enter')
    expect(await hk.firedNames()).toEqual(['submit'])
  })

  test('stopPropagation keeps the key from outer listeners', async ({
    page,
    harness,
  }) => {
    const hk = await harness(FORM)
    await page.evaluate(() => {
      ;(window as unknown as { outer: number }).outer = 0
      document.body.addEventListener('keydown', () => {
        ;(window as unknown as { outer: number }).outer++
      })
    })
    await hk.register('panel', 'K', { target: '#panel' })
    await hk.register('loose', 'J', {
      target: '#panel',
      stopPropagation: false,
    })
    await page.focus('#panel')
    await page.keyboard.press('k')
    await page.keyboard.press('j')
    expect(await hk.firedNames()).toEqual(['panel', 'loose'])
    expect(
      await page.evaluate(() => (window as unknown as { outer: number }).outer),
    ).toBe(1)
  })
})

test.describe('controls that are not text fields', () => {
  const CONTROLS = `
    <input id="checkbox" type="checkbox">
    <input id="radio" type="radio" name="r"><input type="radio" name="r">
    <input id="range" type="range">
    <input id="color" type="color">
    <input id="readonly" type="text" value="abc" readonly>
    <div id="textbox" role="textbox" tabindex="0"></div>
    <div id="searchbox" role="searchbox" tabindex="0"></div>
  `

  for (const id of ['checkbox', 'radio', 'range', 'color', 'readonly']) {
    test(`single keys fire on #${id}`, async ({ page, harness }) => {
      const hk = await harness(CONTROLS)
      await hk.register('k', 'K')
      await page.focus(`#${id}`)
      await page.keyboard.press('k')
      expect(await hk.firedNames()).toEqual(['k'])
    })
  }

  test('a range input keeps its arrow keys', async ({ page, harness }) => {
    const hk = await harness(CONTROLS)
    await hk.register('right', 'ArrowRight')
    await page.focus('#range')
    await page.keyboard.press('ArrowRight')
    expect(await hk.firedNames()).toEqual([])
    expect(await page.locator('#range').inputValue()).toBe('51')
  })

  for (const id of ['textbox', 'searchbox']) {
    test(`#${id} blocks single keys but not Mod chords`, async ({
      page,
      harness,
    }) => {
      const hk = await harness(CONTROLS)
      await hk.register('k', 'K')
      await hk.register('save', 'Mod+S')
      await page.focus(`#${id}`)
      await page.keyboard.press('k')
      await page.keyboard.press(`${hk.mod}+s`)
      expect(await hk.firedNames()).toEqual(['save'])
    })
  }
})

test.describe('shadow DOM', () => {
  test('a text field in a closed shadow root blocks single keys', async ({
    page,
    harness,
  }) => {
    const hk = await harness('<closed-field></closed-field>')
    await page.evaluate(() => {
      customElements.define(
        'closed-field',
        class extends HTMLElement {
          constructor() {
            super()
            const root = this.attachShadow({ mode: 'closed' })
            root.innerHTML = '<input>'
            // Page code can't reach into a closed root, so focus it from here.
            this.addEventListener('click', () =>
              root.querySelector('input')!.focus(),
            )
          }
        },
      )
    })
    await hk.register('k', 'K')
    await hk.register('save', 'Mod+S')
    await page.locator('closed-field').dispatchEvent('click')
    expect(await page.evaluate(() => document.activeElement?.localName)).toBe(
      'closed-field',
    )
    await page.keyboard.press('k')
    await page.keyboard.press(`${hk.mod}+s`)
    expect(await hk.firedNames()).toEqual(['save'])
  })

  test('hasActiveRegistration sees focus on slotted content', async ({
    page,
    harness,
  }) => {
    await harness('<div id="host"><button id="slotted">Slotted</button></div>')
    const active = await page.evaluate(() => {
      const host = document.getElementById('host')!
      const root = host.attachShadow({ mode: 'open' })
      root.innerHTML = '<div id="wrapper"><slot></slot></div>'
      const manager = window.TanStackHotkeys.getHotkeyManager()
      manager.register('Shift+Q', () => {}, {
        target: root.getElementById('wrapper')!,
      })
      document.getElementById('slotted')!.focus()
      return manager.hasActiveRegistration('Shift+Q')
    })
    expect(active).toBe(true)
  })
})
