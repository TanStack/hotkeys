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
