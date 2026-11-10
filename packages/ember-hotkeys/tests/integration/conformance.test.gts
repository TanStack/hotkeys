import Component from '@glimmer/component'
import type { TOC } from '@ember/component/template-only'
import { tracked } from '@glimmer/tracking'
import { render, settled } from '@ember/test-helpers'
import { setupRenderingTest } from 'ember-qunit'
import * as QUnit from 'qunit'
import {
  createExpect,
  runConformanceSuite,
} from '@tanstack/hotkeys-test-utils/conformance'
import {
  createHotkeysScope, onHotkey, onHotkeys, provideAppHotkeys,
  useFormatForDisplay, useHeldKeyCodes, useHeldKeys, useHotkey, useHotkeyHint,
  useHotkeyRecorder, useHotkeyRegistrations, useHotkeys, useKeyHold,
} from '@tanstack/ember-hotkeys'
import type {
  ConformanceHarness, ConformanceHotkey, ConformanceProvider, ConformanceRunner,
  HintSpec, HotkeysSpec, RecorderSpec,
} from '@tanstack/hotkeys-test-utils/conformance'
import type {
  DefaultHotkeysOptions, EmberHotkeyDefinition, EmberHotkeyRecorder,
  EmberHotkeysScope, HotkeyRegistrationView, IndividualKey,
} from '@tanstack/ember-hotkeys'

// The shared conformance suite (test-utils/src/conformance) on QUnit. One
// stage component renders every mounted view, since a rendering test renders
// once.

class Stage {
  // Each view's component takes a matching `@model`.
  @tracked views: Array<{ component: TOC<{ Args: { model: never } }>; model: never }> = []
}
let stage = new Stage()

async function show(component: unknown, model: unknown) {
  const view = { component: component as TOC<{ Args: { model: never } }>, model: model as never }
  stage.views = [...stage.views, view]
  await settled()
  return async () => {
    stage.views = stage.views.filter((item) => item !== view)
    await settled()
  }
}

const settle = async (change: () => unknown) => {
  change()
  await settled()
}

/** Ember scopes take defaults, including `platform`, but no hotkey scope. */
function defaultsFor(provider: ConformanceProvider | undefined): DefaultHotkeysOptions {
  return provider ? { platform: provider.platform, hotkey: provider.hotkey } : {}
}

/** Options without `target`, which the `onHotkey` modifier replaces. */
function optionsOf(entry: ConformanceHotkey) {
  const { target: _target, ...rest } = entry.options ?? {}
  return rest
}
const onElement = (entry: ConformanceHotkey) => entry.options?.target === 'element'

class HeldKeysModel {
  @tracked watch: IndividualKey
  constructor(watch: IndividualKey) { this.watch = watch }
}
class HeldKeysView extends Component<{ Args: { model: HeldKeysModel } }> {
  keys = useHeldKeys(this)
  codes = useHeldKeyCodes(this)
  hold = useKeyHold(this, () => this.args.model.watch)
  get keysText() { return JSON.stringify(this.keys.value) }
  get codesText() { return JSON.stringify(this.codes.value) }
  <template>
    <output data-testid="keys">{{this.keysText}}</output>
    <output data-testid="codes">{{this.codesText}}</output>
    <output data-testid="held">{{if this.hold.value "true" "false"}}</output>
  </template>
}

class RegistrationsModel { latest: Array<HotkeyRegistrationView> = [] }
class RegistrationsView extends Component<{ Args: { model: RegistrationsModel } }> {
  registrations = useHotkeyRegistrations(this)
  get count() {
    this.args.model.latest = this.registrations.hotkeys
    return this.registrations.hotkeys.length
  }
  <template><output data-testid="count">{{this.count}}</output></template>
}

class HotkeysModel {
  @tracked spec: HotkeysSpec
  scope: EmberHotkeysScope | undefined
  constructor(spec: HotkeysSpec) {
    this.spec = spec
    // A view with a provider gets a scope that follows its defaults.
    if (spec.provider) this.scope = createHotkeysScope(() => defaultsFor(this.spec.provider))
  }
  // Helpers take new arguments, callbacks included, so items keep their index.
  get items() {
    return this.spec.hotkeys.map((entry) => ({
      entry, options: optionsOf(entry), element: onElement(entry),
    }))
  }
  definitions(element: boolean): Array<EmberHotkeyDefinition> {
    return this.spec.hotkeys.filter((entry) => onElement(entry) === element)
      .map((entry) => ({ hotkey: entry.hotkey, callback: entry.callback, options: optionsOf(entry) }) as EmberHotkeyDefinition)
  }
  get documentList() { return this.definitions(false) }
  get elementList() { return this.definitions(true) }
  get isList() { return this.spec.form === 'list' }
}
// Helpers take options as named arguments, so each one is listed.
const HotkeysView: TOC<{ Args: { model: HotkeysModel } }> = <template>
  {{#let @model.scope as |scope|}}
    {{#if @model.isList}}
      {{#if scope}}
        {{scope.useHotkeys @model.documentList}}
        <div tabindex="0" data-conformance-target {{scope.onHotkeys @model.elementList}}></div>
      {{else}}
        {{useHotkeys @model.documentList}}
        <div tabindex="0" data-conformance-target {{onHotkeys @model.elementList}}></div>
      {{/if}}
    {{else}}
      {{#each @model.items key="@index" as |item|}}
        {{#if item.element}}
          {{#if scope}}
            <div tabindex="0" data-conformance-target {{scope.onHotkey item.entry.hotkey item.entry.callback enabled=item.options.enabled eventType=item.options.eventType meta=item.options.meta platform=item.options.platform preventDefault=item.options.preventDefault requireReset=item.options.requireReset scope=item.options.scope timeout=item.options.timeout}}></div>
          {{else}}
            <div tabindex="0" data-conformance-target {{onHotkey item.entry.hotkey item.entry.callback enabled=item.options.enabled eventType=item.options.eventType meta=item.options.meta platform=item.options.platform preventDefault=item.options.preventDefault requireReset=item.options.requireReset scope=item.options.scope timeout=item.options.timeout}}></div>
          {{/if}}
        {{else if scope}}
          {{scope.useHotkey item.entry.hotkey item.entry.callback enabled=item.options.enabled eventType=item.options.eventType meta=item.options.meta platform=item.options.platform preventDefault=item.options.preventDefault requireReset=item.options.requireReset scope=item.options.scope timeout=item.options.timeout}}
        {{else}}
          {{useHotkey item.entry.hotkey item.entry.callback enabled=item.options.enabled eventType=item.options.eventType meta=item.options.meta platform=item.options.platform preventDefault=item.options.preventDefault requireReset=item.options.requireReset scope=item.options.scope timeout=item.options.timeout}}
        {{/if}}
      {{/each}}
    {{/if}}
  {{/let}}
</template>

class RecorderModel {
  recorder?: EmberHotkeyRecorder
  constructor(public spec: RecorderSpec) {}
}
class RecorderView extends Component<{ Args: { model: RecorderModel } }> {
  constructor(...args: ConstructorParameters<typeof Component<{ Args: { model: RecorderModel } }>>) {
    super(...args)
    const { spec } = this.args.model
    const scope = spec.provider ? createHotkeysScope(defaultsFor(spec.provider)) : undefined
    this.args.model.recorder = useHotkeyRecorder(this, spec.options as never, scope)
  }
  <template></template>
}

class HintModel {
  @tracked hotkey: HintSpec['hotkey']
  constructor(public spec: HintSpec) { this.hotkey = spec.hotkey }
}
class HintView extends Component<{ Args: { model: HintModel } }> {
  hint = useHotkeyHint(this, () => this.args.model.hotkey, this.args.model.spec.options)
  <template><output data-testid="hint">{{if this.hint.value "true" "false"}}</output></template>
}

const text = (id: string) =>
  document.querySelector(`[data-testid="${id}"]`)?.textContent ?? ''

const disposers = new Set<() => void>()

const harness: ConformanceHarness = {
  name: 'Ember',
  unsupported: {
    'provider-scope': 'createHotkeysScope sets defaults but has no hotkey scope; use core activateScope',
  },
  act: settle,
  async setup() {
    stage = new Stage()
    const current = stage
    await render(<template>
      {{#each current.views as |view|}}
        <view.component @model={{view.model}} />
      {{/each}}
    </template>)
  },
  async cleanup() {
    stage.views = []
    for (const dispose of disposers) dispose()
    disposers.clear()
    await settled()
  },

  async mountHeldKeys(watch) {
    const model = new HeldKeysModel(watch)
    const unmount = await show(HeldKeysView, model)
    return {
      keys: () => JSON.parse(text('keys')),
      codes: () => JSON.parse(text('codes')),
      held: () => text('held') === 'true',
      setKey: (key) => settle(() => (model.watch = key)),
      unmount,
    }
  },

  async mountRegistrations() {
    const model = new RegistrationsModel()
    const unmount = await show(RegistrationsView, model)
    return { list: () => model.latest, rendered: () => Number(text('count')), unmount }
  },

  async mountHotkeys(initial) {
    const app = initial.provider?.appHotkeys
      ? provideAppHotkeys(initial.provider.appHotkeys, {
          customHotkeys: initial.provider.customHotkeys ?? undefined,
        })
      : undefined
    if (app) disposers.add(app.dispose)
    const model = new HotkeysModel(initial)
    const hide = await show(HotkeysView, model)
    return {
      update: (next) => settle(() => {
        model.spec = { ...model.spec, ...next }
        if (next.provider && app) {
          app.store.setOptions({ customHotkeys: next.provider.customHotkeys ?? undefined })
        }
      }),
      element: () => document.querySelector<HTMLElement>('[data-conformance-target]')!,
      unmount: async () => {
        await hide()
        if (app) { app.dispose(); disposers.delete(app.dispose) }
      },
    }
  },

  async mountRecorder(spec) {
    const model = new RecorderModel(spec)
    const unmount = await show(RecorderView, model)
    const recorder = () => model.recorder!
    return {
      state: () => ({
        isRecording: recorder().isRecording,
        steps: recorder().steps,
        recordedHotkey: recorder().recordedHotkey,
      }),
      start: () => settle(() => recorder().startRecording()),
      stop: () => settle(() => recorder().stopRecording()),
      cancel: () => settle(() => recorder().cancelRecording()),
      commit: () => settle(() => recorder().commitRecording()),
      unmount,
    }
  },

  async mountHint(spec) {
    const model = new HintModel(spec)
    const unmount = await show(HintView, model)
    return {
      value: () => text('hint') === 'true',
      setHotkey: (hotkey) => settle(() => (model.hotkey = hotkey)),
      unmount,
    }
  },

  mountFormat({ platform }) {
    const format = useFormatForDisplay(platform ? createHotkeysScope({ platform }) : undefined)
    return { format: (hotkey, options) => format(hotkey, options ?? {}), unmount: () => {} }
  },
}

/** Runs the suite's cases as nested QUnit modules. */
function qunitRunner(): ConformanceRunner {
  const hooks: Array<NestedHooks> = []
  const wrap = (body: () => Promise<void>) => async (assert: Assert) => {
    await body()
    assert.true(true, 'every check passed')
  }
  return {
    describe: (name, body) => QUnit.module(name, (nested) => {
      hooks.push(nested)
      body()
      hooks.pop()
    }),
    it: (name, body) => QUnit.test(name, wrap(body)),
    skip: (name) => QUnit.skip(name),
    beforeEach: (body) => hooks.at(-1)!.beforeEach(async () => body()),
    afterEach: (body) => hooks.at(-1)!.afterEach(async () => body()),
    expect: createExpect(),
  }
}

QUnit.module('Ember', (hooks) => {
  setupRenderingTest(hooks)
  runConformanceSuite(qunitRunner(), harness)
})
