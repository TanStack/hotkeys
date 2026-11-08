# TanStack Hotkeys — Skill Spec

TanStack Hotkeys is a type-safe keyboard shortcut library with a framework-agnostic core (`@tanstack/hotkeys`) and adapters for React, Preact, Solid, Vue, Svelte, Angular, Lit, Alpine, Ember, and Octane. It owns listeners, platform modifiers, layout matching, input filtering, browser defaults, key repeat, scopes, a shortcut catalog (app hotkeys), recording, and held-key state.

The skills teach agents to use those APIs directly. The core skills hold the framework-neutral rules and the workarounds to replace; each adapter skill holds its bindings, reactivity rules, and framework-specific mistakes.

## Domains

| Domain             | Description                                                                                          | Skills                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Hotkeys            | Registering, matching, scoping, and labeling shortcuts, and the keyboard behavior the library owns   | hotkeys-core                                                                                                                                           |
| App hotkeys        | One catalog of every shortcut for cheat sheets, rebinding, conflict checks, and saved custom hotkeys | app-hotkeys                                                                                                                                            |
| Framework bindings | Adapter APIs, reactivity rules, provider or manager scopes, element targets                          | react-hotkeys, preact-hotkeys, solid-hotkeys, vue-hotkeys, svelte-hotkeys, angular-hotkeys, lit-hotkeys, alpine-hotkeys, ember-hotkeys, octane-hotkeys |

## Skill Inventory

| Skill           | Type      | Domain             | What it covers                                                                                                     | Failure modes |
| --------------- | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------- |
| hotkeys-core    | core      | hotkeys            | Workaround → adapter API table, enabled/lifetime/scope/target, non-obvious pitfalls, scopes and testing references | 11            |
| app-hotkeys     | core      | app-hotkeys        | Declarations, provider, registration, custom hotkeys, persistence, conflicts, recording reference                  | 8             |
| react-hotkeys   | framework | framework-bindings | Hooks, refs, providers, dialog scopes, app hotkey wiring                                                           | 2 + shared    |
| preact-hotkeys  | framework | framework-bindings | Same as React with Preact imports                                                                                  | 2 + shared    |
| solid-hotkeys   | framework | framework-bindings | Primitives, accessor options, signal targets                                                                       | 2 + shared    |
| vue-hotkeys     | framework | framework-bindings | Composables, refs and getters, component-ref targets, provideHotkeysContext, recorder refs                         | 4 + shared    |
| svelte-hotkeys  | framework | framework-bindings | Getter options, attachments, setHotkeysContext, reactive getters                                                   | 3 + shared    |
| angular-hotkeys | framework | framework-bindings | Inject functions, signal options, provideHotkeys scopes, per-instance scope tokens                                 | 4 + shared    |
| lit-hotkeys     | framework | framework-bindings | Decorator, controllers, manager scopes, decorator mode                                                             | 4 + shared    |
| alpine-hotkeys  | framework | framework-bindings | Owners, $hotkeys magic, getter options, manager scopes                                                             | 3 + shared    |
| ember-hotkeys   | framework | framework-bindings | Template helpers, modifiers, owner-bound readers, manager scopes                                                   | 3 + shared    |
| octane-hotkeys  | framework | framework-bindings | Hooks in .tsrx, ref and element-state targets, providers                                                           | 2 + shared    |

"Shared" failure modes are listed under hotkeys-core, app-hotkeys, and lit-hotkeys with a `skills` list in `domain_map.yaml`: hand-written listeners, facades, topmost-dialog tracking, reused exclusive scope names, registering an app hotkey's value, and loading custom hotkeys late.

## Failure Mode Inventory

### hotkeys-core (11 failure modes)

| #   | Mistake                                           | Priority | Source                              | Cross-skill?                      |
| --- | ------------------------------------------------- | -------- | ----------------------------------- | --------------------------------- |
| 1   | Reading key events instead of registering hotkeys | HIGH     | docs/guides/sensible-defaults.md    | all framework skills              |
| 2   | Wrapping the library in a shortcut facade         | HIGH     | Maintainer report, 2026-10-18       | app-hotkeys, all framework skills |
| 3   | Disabling a hotkey to skip its action             | HIGH     | react guides/hotkeys.md             | —                                 |
| 5   | Tracking the topmost dialog with enabled          | HIGH     | issue #42                           | all framework skills              |
| 6   | Reusing one exclusive scope name                  | HIGH     | src/hotkey-manager.ts               | all framework skills              |
| 8   | Toggling without requireReset                     | MEDIUM   | sensible-defaults.md                | —                                 |
| 9   | Letters for position-based controls               | MEDIUM   | sensible-defaults.md                | —                                 |
| 10  | Expecting extra modifiers to match                | MEDIUM   | sensible-defaults.md, runtime probe | —                                 |
| 11  | Non-focusable element target                      | MEDIUM   | sensible-defaults.md                | —                                 |
| 12  | A second copy of @tanstack/hotkeys                | MEDIUM   | src/_manager-ref.ts                 | —                                 |
| 13  | Testing without a fixed platform                  | MEDIUM   | src/platform.ts, runtime probe      | —                                 |

### app-hotkeys (8 failure modes)

| #   | Mistake                                          | Priority | Source                             | Cross-skill?         |
| --- | ------------------------------------------------ | -------- | ---------------------------------- | -------------------- |
| 1   | Keeping a parallel shortcut registry             | HIGH     | guides/app-hotkeys.md              | —                    |
| 2   | Registering the app hotkey value                 | HIGH     | src/adapter.ts, task check         | all framework skills |
| 3   | Loading custom hotkeys after the provider exists | HIGH     | src/app-hotkeys.ts, every provider | all framework skills |
| 4   | Ignoring setCustomHotkey conflicts               | HIGH     | src/app-hotkeys.ts                 | —                    |
| 5   | Saving the effective list                        | MEDIUM   | guides/app-hotkeys.md, task check  | —                    |
| 6   | Sharing keys without declared scopes             | MEDIUM   | src/app-hotkeys.ts                 | —                    |
| 7   | A recorder built from keydown events             | HIGH     | guides/custom-hotkey-recording.md  | —                    |
| 8   | Rewriting recorded physical bindings             | MEDIUM   | sensible-defaults.md               | —                    |

### Framework skills

| Skill           | Mistakes                                                                                                                                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| react-hotkeys   | ref.current as target (HIGH, task check); hotkey above its own provider (HIGH, task check)                                                                                                                                                 |
| preact-hotkeys  | ref.current as target (HIGH); hotkey above its own provider (HIGH)                                                                                                                                                                         |
| solid-hotkeys   | plain options object (HIGH); unassigned element variable as target (HIGH)                                                                                                                                                                  |
| vue-hotkeys     | ref.value instead of the ref (HIGH); provider in the same component (HIGH); nested recorder refs in templates (MEDIUM); component ref without a single root (MEDIUM)                                                                       |
| svelte-hotkeys  | plain options object (HIGH); destructuring reactive getters (HIGH); hotkeys before setHotkeysContext (HIGH)                                                                                                                                |
| angular-hotkeys | @HostListener (HIGH); plain options object (HIGH); shared exclusive scope across instances (HIGH); outside an injection context (MEDIUM); plain fields in a root-service callback (MEDIUM); scope in Route.providers (MEDIUM)              |
| lit-hotkeys     | unreleased manager scope (HIGH, also alpine and ember); HotkeyController not added to host (HIGH); @hotkey with standard decorators (MEDIUM); instance state in decorator options (MEDIUM); removeController instead of dispose() (MEDIUM) |
| alpine-hotkeys  | owner never destroyed (HIGH); createHotkeysScope mistaken for a scope (HIGH); plain options object (HIGH)                                                                                                                                  |
| ember-hotkeys   | unbound method callback (HIGH); string sequence in a template (MEDIUM); createHotkeysScope mistaken for a scope (HIGH)                                                                                                                     |
| octane-hotkeys  | ref object for an element that mounts later (HIGH); hooks in loops (MEDIUM)                                                                                                                                                                |

## Tensions

| Tension                                         | Skills                     | Agent implication                                                                            |
| ----------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------------- |
| Component lifetime versus one catalog           | hotkeys-core ↔ app-hotkeys | Agents move callbacks into a central registry, or build cheat sheets from live registrations |
| Logical declarations versus physical recordings | app-hotkeys                | A rebinding to Command+P passes conflict checks and then runs two actions                    |

## Cross-References

| From                 | To           | Reason                                                             |
| -------------------- | ------------ | ------------------------------------------------------------------ |
| each framework skill | hotkeys-core | Required: hotkey format, defaults, workaround table                |
| each framework skill | app-hotkeys  | Its app hotkeys reference shows wiring; app-hotkeys owns the rules |
| app-hotkeys          | hotkeys-core | Same hotkey format, scopes, and registration rules                 |

## Subsystems & Reference Candidates

| Skill                | Subsystems | Reference files                |
| -------------------- | ---------- | ------------------------------ |
| hotkeys-core         | —          | scopes, testing                |
| app-hotkeys          | —          | recording                      |
| each framework skill | —          | app-hotkeys (framework wiring) |

## Remaining Gaps

| Skill                                 | Question                                                                                                                                        | Status   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| app-hotkeys                           | Should conflict checks treat `Mod+[KeyP]` as overlapping `Mod+P`? Today a recorded physical binding never conflicts with a logical declaration. | open     |
| lit-hotkeys                           | Document that `@hotkey` needs `experimentalDecorators`, or support standard decorators                                                          | open     |
| octane-hotkeys                        | `docs/installation.md` says Octane 0.1.36 within 0.1; the peer range is `>=0.12.0`                                                              | resolved |
| framework skills except react-hotkeys | No executable task checks yet                                                                                                                   | open     |
| all                                   | Fresh-consumer and discovery evaluations not run                                                                                                | open     |

## Recommended Skill File Structure

- **Core skills:** `packages/hotkeys/skills/hotkeys-core` and `packages/hotkeys/skills/app-hotkeys`. Every adapter depends on `@tanstack/hotkeys`, and Intent discovers skills in transitive dependencies, so consumers of any adapter get them.
- **Framework skills:** one per adapter package, named `<framework>-hotkeys` so names stay unique when skills from several libraries are installed side by side.
- **Lifecycle and composition skills:** none in this batch.
- **Reference files:** conditional detail only, each linked from its skill with a reading condition.

## Composition Opportunities

| Library           | Integration points                     | Composition skill needed?                            |
| ----------------- | -------------------------------------- | ---------------------------------------------------- |
| TanStack Router   | Navigation hotkeys, route-level scopes | No; the core and framework skills cover registration |
| TanStack Devtools | Hotkeys devtools panel                 | No; one line per framework skill                     |

## Coverage and batch history

### Batch 1 — 2026-10-18 — initial skills

- **Scope:** the basics and pitfalls of registering hotkeys, scopes, display, app hotkeys, recording, and testing, for the core package and all ten adapters. Devtools packages, the `@tanstack/hotkeys/adapter` entry point for adapter authors, and the formatter's layout-map options are out of scope.
- **Source:** commit `ad56a4b0` (`@tanstack/hotkeys` 0.16.0; React, Preact, Solid, Vue, Svelte, Angular 0.15.0; Lit 0.16.0; Alpine and Ember 0.4.0; Octane 0.5.0). Intent 0.5.5.
- **Maintainer decisions:**
  - Skills teach basic patterns, then the mistakes and workarounds agents produce. Agents tend to build facades and wrappers around the library; the skills point to the native API for each workaround.
  - Keep volume low. Exact signatures come from the installed `.d.ts` files, not from the skills. Conditional detail lives in references.
  - Package-only distribution (`distribution: none`). Repository distribution can be added later with `maintainer setup --distribution repo`.
- **Authoring decisions:**
  - Framework-neutral rules have one home in the core skills; framework skills require `@tanstack/hotkeys#hotkeys-core` and keep only their own bindings and mistakes.
  - Skill names carry the package name (`react-hotkeys`, not `react`) so flattened installs don't collide with other libraries' skills.
  - Guides are linked by URL pattern (`https://tanstack.com/hotkeys/latest/docs/framework/<framework>/guides/<page>.md`) instead of being copied.
- **Checks:**
  - `intent validate` passes for all 12 skills.
  - Intent's example checker resolves bare imports from the repository root, where no framework is installed, and compiles with `jsx: preserve` and standard decorators. Fences it can't check are marked `no-check`: Preact and Solid JSX with provider children, Lit classes that extend `LitElement`, and Alpine components that use magics. Every `ts` and `tsx` fence, including those, also type-checks inside a matching project in `examples/` (only names omitted on purpose were tolerated).
  - Executable task checks: `packages/react-hotkeys/tests/skills/editor-shortcuts` and `packages/react-hotkeys/tests/skills/shortcut-settings`. Each grader accepts the expected solution and rejects the starting fixture and every listed mistake for the documented reason.
  - Runtime probes on 2026-10-18 confirmed: aliases such as `ctrl+k` parse; comma lists keep only the first chord; string sequences never match; extra modifiers never match; disabled hotkeys don't call `preventDefault`; the recorder records `Mod+[KeyS]`-style physical bindings; happy-dom on macOS detects `windows`; app hotkey and live conflict checks don't match `Mod+[KeyP]` against `Mod+P`, and both registrations fire on Command+P.
  - Not run: fresh-consumer sessions and discovery evaluations.
- **Remaining work:** the gaps above, task checks for the other adapters, and a fresh-consumer run of both React tasks.

### Batch 1 revision — 2026-10-18 — maintainer review

- **Maintainer decisions:**
  - Cut content an agent already knows or the tooling reports. Invalid hotkey strings are TypeScript errors, so the syntax pitfall and the other-library syntax reference were removed.
  - Don't mention the hotkey manager where the adapter has a provider: use the adapter's hooks and functions. Lit, Alpine, and Ember keep `activateScope`, because they have no provider for scopes.
- **Changes:** `hotkeys-core` went from 293 to 73 lines: the vanilla setup, defaults table, hotkey format, display section, and code-pair mistakes were replaced by the workaround table, the on/off order, and one-line pitfalls. The `sequences` and `from-other-libraries` references were folded into two pitfalls and deleted. `scopes` and `testing` dropped manager code. `app-hotkeys`, the recording reference, every framework skill, and every framework app hotkeys reference were trimmed the same way. Total skill content fell from 4,529 to 1,767 lines.
- **Failure modes retired:** other-library hotkey syntax (TypeScript reports it) and React's manager-in-`useEffect` (dropped so the skills don't introduce the manager). Unreleased manager scopes moved from hotkeys-core to the Lit, Alpine, and Ember skills.
- **Checks:** `intent validate` passes; every fence type-checks in its example project; the React task checks still pass.

### Batch 1 revision 2 — 2026-10-19 — full API lists

- **Maintainer decision:** each framework skill lists every hook and function its adapter defines, with one sentence on what each is for, so agents see the whole surface before reaching for a workaround. The `.d.ts` files stay the source for signatures and options.
- **Changes:** the short task-to-API table in each of the 10 framework skills became an `## API` table with one row per export, 127 in all. Lit, Alpine, and Ember also list the two core calls they need, `provideAppHotkeys` and `getHotkeyManager().activateScope`; Alpine lists its 12 owner methods separately. Each table ends with a note that the adapter re-exports `@tanstack/hotkeys`. Core functions aren't repeated in each skill.
- **Source sync:** the AltGr fix (#193) changed `hotkey-recorder.ts` and the AltGr notes in `docs/guides/sensible-defaults.md`. No skill covers AltGr, so `hotkeys-core` and `app-hotkeys` are unchanged.
- **Checks:** a TypeScript export listing confirmed every adapter export appears in its skill; `intent validate` passes.

### Batch 1 revision 3 — 2026-11-08 — Lit controller cleanup

- **Source change:** every Lit controller gained `dispose()`, which runs `hostDisconnected()` and removes the controller from its host. `@hotkey` on a subclass override now replaces the parent's hotkeys for that method instead of registering a second time.
- **Changes:** `lit-hotkeys` gained two pitfalls: remove a controller with `dispose()`, not `removeController`; and decorating an override replaces the parent's hotkeys. `domain_map.yaml` records the `removeController` failure mode.
- **Checks:** both pitfalls are covered by `packages/lit-hotkeys/tests/lifecycle.test.ts` and `decorators.test.ts`.

### Batch 1 revision 4 — 2026-11-08 — Angular change detection

- **Source sync:** `injectHotkeys` and `injectHotkeyRecorder` now mark the registering component for check after each callback (`src/_zone.ts`), so plain field changes render in OnPush components and zoneless apps. Keys that fire no hotkey still don't run change detection.
- **Changes:** `angular-hotkeys` gained one pitfall: a service outside any component, such as a root service, has no component to mark, so its hotkeys should change signals. The Angular failure modes in `domain_map.yaml` and the table above list it. `skill_tree.yaml` is unchanged.
- **Checks:** `packages/angular-hotkeys/tests/change-detection.test.ts` and `tests/zone.test.ts` cover zone and zoneless, Default and OnPush, field and signal callbacks, the recorder, and a root service. `intent validate` passes. Not run: fresh-consumer sessions.

### Source sync — 2026-11-08 — element targets that aren't ready yet

- **Source:** branch `fix/unset-element-targets` from `06ce5e34`. `prepareHotkeyDefinitions` now treats a `target` that is set to `undefined`, or a `resolveTarget` result of `undefined`, like `null`: the hotkey waits. Only an omitted `target` listens on `document`. Vue unwraps a component ref to its root element when the ref is set (a fragment or text root waits; a root added later is not followed). Octane accepts ref objects as `target`, like React.
- **Changes:** the Angular, Solid, and Octane skills no longer say an undefined target means `document`; Octane drops "targets are elements, not ref objects" for a mounts-later pitfall; Vue gains a component-ref pitfall. `domain_map.yaml` mechanisms for React, Preact, Solid, Angular, and Octane follow the new rule, and Vue gains one failure mode. React, Preact, Lit, and core skills were reviewed with no change: their target guidance still holds.
- **Checks:** `intent validate` passes; adapter tests cover each case (core, React, Preact, Vue, Solid, Angular, Octane). Not run: fresh-consumer sessions.

### Batch 1 revision 5 — 2026-11-08 — Angular recorder defaults and route scopes

- **Source sync:** `injectHotkeyRecorder` now reads the provider's `hotkeyRecorder` defaults on each options sync instead of copying them at injection, so signal-driven defaults reach the recorder. `injectDefaultHotkeysOptions()` still returns the defaults at injection time; its JSDoc now says so and points to `injectHotkeysContext().defaultOptions` for tracked reads. Changing its return type to a signal was left as an API decision.
- **Changes:** `angular-hotkeys` gained one pitfall: a scoped `provideHotkeys` in `Route.providers` outlives navigation, because by default the router keeps route injectors. The pitfall and the guide name `withAutoCleanupInjectors()` as an alternative, with its Angular 22.2 floor and its `shouldDestroyInjector` requirement. The Angular failure modes in `domain_map.yaml` and the table above list it. `skill_tree.yaml` is unchanged.
- **Checks:** `packages/angular-hotkeys/tests/reactive-options.test.ts` covers a signal-driven provider recorder default. A scratch router test on `@angular/router` 22.2.5 (not committed, because the package has no router dependency) showed the route scope suspending another page's hotkey after navigation, and `withAutoCleanupInjectors()` ending it. `intent validate` passes. Not run: fresh-consumer sessions.
