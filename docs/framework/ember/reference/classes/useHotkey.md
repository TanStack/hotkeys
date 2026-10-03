---
id: useHotkey
title: useHotkey
---

Defined in: packages/ember-hotkeys/src/useHotkey.ts:17

Use {{useHotkey "Mod+S" this.save enabled=this.enabled}} in a template.

## Extends

- `default`\<\{
  `Args`: \{
     `Named`: `HotkeyOptions`;
     `Positional`: \[`RegisterableHotkey`, `HotkeyCallback`\];
  \};
  `Return`: `void`;
\}\>

## Constructors

### Constructor

```ts
new useHotkey(owner?): UseHotkey;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:28

#### Parameters

##### owner?

`Owner`

#### Returns

`UseHotkey`

#### Inherited from

```ts
Helper<{
  Args: {
    Positional: [RegisterableHotkey, HotkeyCallback]
    Named: HotkeyOptions
  }
  Return: void
}>.constructor
```

## Properties

### \[Invoke\]

```ts
[Invoke]: (...args) => void;
```

Defined in: node\_modules/.pnpm/@glint+template@1.9.0/node\_modules/@glint/template/-private/integration.d.ts:22

#### Parameters

##### args

...\[`RegisterableHotkey`, `HotkeyCallback`, `NamedArgs`\<`HotkeyOptions`\>\]

#### Returns

`void`

#### Inherited from

```ts
Helper.[Invoke]
```

***

### \[OWNER\]?

```ts
optional [OWNER]?: Owner;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:77

**`Internal`**

#### Inherited from

```ts
Helper.[OWNER]
```

***

### \[RECOMPUTE\_TAG\]

```ts
[RECOMPUTE_TAG]: DirtyableTag;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/-internals/glimmer/lib/helper.d.ts:103

#### Inherited from

```ts
Helper.[RECOMPUTE_TAG]
```

***

### concatenatedProperties?

```ts
optional concatenatedProperties?: string | string[];
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:637

#### Inherited from

```ts
Helper.concatenatedProperties
```

***

### mergedProperties?

```ts
optional mergedProperties?: unknown[];
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:638

#### Inherited from

```ts
Helper.mergedProperties
```

***

### \_lazyInjections?

```ts
readonly static optional _lazyInjections?: () => void;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:636

#### Returns

`void`

#### Inherited from

```ts
Helper._lazyInjections
```

***

### \_onLookup?

```ts
readonly static optional _onLookup?: (debugContainerKey) => void;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:635

#### Parameters

##### debugContainerKey

`string`

#### Returns

`void`

#### Inherited from

```ts
Helper._onLookup
```

***

### \_without

```ts
static _without: any[] | undefined;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/mixin.d.ts:113

**`Internal`**

#### Inherited from

```ts
Helper._without
```

***

### \[INIT\_FACTORY\]?

```ts
static optional [INIT_FACTORY]?: null;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/mixin.d.ts:114

#### Inherited from

```ts
Helper.[INIT_FACTORY]
```

***

### \[IS\_CLASSIC\_HELPER\]

```ts
static [IS_CLASSIC_HELPER]: boolean;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/-internals/glimmer/lib/helper.d.ts:100

#### Inherited from

```ts
Helper.[IS_CLASSIC_HELPER]
```

***

### ~~helper~~

```ts
static helper: {
<P, N, R>  (helperFn): FunctionBasedHelper<{
  Args: {
     Named: N;
     Positional: P;
  };
  Return: R;
}>;
<S>  (helperFn): FunctionBasedHelper<S>;
};
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/-internals/glimmer/lib/helper.d.ts:102

#### Call Signature

```ts
<P, N, R>(helperFn): FunctionBasedHelper<{
  Args: {
     Named: N;
     Positional: P;
  };
  Return: R;
}>;
```

In many cases it is not necessary to use the full `Helper` class.
The `helper` method create pure-function helpers without instances.
For example:

```app/helpers/format-currency.js
import { helper } from '@ember/component/helper';

export default helper(function([cents], {currency}) {
  return `${currency}${cents * 0.01}`;
});
```

##### Type Parameters

###### P

`P` *extends* `DefaultPositional`

###### N

`N` *extends* `object`

###### R

`R` = `unknown`

##### Parameters

###### helperFn

(`positional`, `named`) => `R`

##### Returns

`FunctionBasedHelper`\<\{
  `Args`: \{
     `Named`: `N`;
     `Positional`: `P`;
  \};
  `Return`: `R`;
\}\>

##### Static

##### Method

helper

##### For

@ember/component/helper

##### Since

1.13.0

#### Call Signature

```ts
<S>(helperFn): FunctionBasedHelper<S>;
```

In many cases it is not necessary to use the full `Helper` class.
The `helper` method create pure-function helpers without instances.
For example:

```app/helpers/format-currency.js
import { helper } from '@ember/component/helper';

export default helper(function([cents], {currency}) {
  return `${currency}${cents * 0.01}`;
});
```

##### Type Parameters

###### S

`S`

##### Parameters

###### helperFn

(`positional`, `named`) => `GetOr`\<`S`\>

##### Returns

`FunctionBasedHelper`\<`S`\>

##### Static

##### Method

helper

##### For

@ember/component/helper

##### Since

1.13.0

#### Deprecated

#### Inherited from

```ts
Helper.helper
```

***

### isClass

```ts
readonly static isClass: boolean;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:633

#### Inherited from

```ts
Helper.isClass
```

***

### isHelperFactory

```ts
static isHelperFactory: boolean;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/-internals/glimmer/lib/helper.d.ts:99

#### Inherited from

```ts
Helper.isHelperFactory
```

***

### isMethod

```ts
readonly static isMethod: boolean;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:634

#### Inherited from

```ts
Helper.isMethod
```

***

### mixins

```ts
static mixins: Mixin[] | undefined;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/mixin.d.ts:105

**`Internal`**

#### Inherited from

```ts
Helper.mixins
```

***

### ownerConstructor

```ts
static ownerConstructor: any;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/mixin.d.ts:111

**`Internal`**

#### Inherited from

```ts
Helper.ownerConstructor
```

***

### properties

```ts
static properties:
  | {
[key: string]: any;
}
  | undefined;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/mixin.d.ts:107

**`Internal`**

#### Inherited from

```ts
Helper.properties
```

***

### PrototypeMixin

```ts
static PrototypeMixin: any;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:629

#### Inherited from

```ts
Helper.PrototypeMixin
```

***

### superclass

```ts
static superclass: any;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:630

#### Inherited from

```ts
Helper.superclass
```

## Accessors

### \_debugContainerKey

#### Get Signature

```ts
get _debugContainerKey(): false | `${string}:${string}`;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/index.d.ts:30

##### Returns

`false` \| `` `${string}:${string}` ``

#### Inherited from

```ts
Helper._debugContainerKey
```

***

### isDestroyed

#### Get Signature

```ts
get isDestroyed(): boolean;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:270

Destroyed object property flag.

if this property is `true` the observers and bindings were already
removed by the effect of calling the `destroy()` method.

##### Default

```ts
false
@public
```

##### Returns

`boolean`

#### Set Signature

```ts
set isDestroyed(_value): void;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:271

##### Parameters

###### \_value

`boolean`

##### Returns

`void`

#### Inherited from

```ts
Helper.isDestroyed
```

***

### isDestroying

#### Get Signature

```ts
get isDestroying(): boolean;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:282

Destruction scheduled flag. The `destroy()` method has been called.

The object stays intact until the end of the run loop at which point
the `isDestroyed` flag is set.

##### Default

```ts
false
@public
```

##### Returns

`boolean`

#### Set Signature

```ts
set isDestroying(_value): void;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:283

##### Parameters

###### \_value

`boolean`

##### Returns

`void`

#### Inherited from

```ts
Helper.isDestroying
```

## Methods

### \_super()

```ts
_super(...args): any;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:73

**`Internal`**

#### Parameters

##### args

...`any`[]

#### Returns

`any`

#### Inherited from

```ts
Helper._super
```

***

### addObserver()

#### Call Signature

```ts
addObserver<Target>(
   key,
   target,
   method): this;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:322

Adds an observer on a property.

This is the core method used to register an observer for a property.

Once you call this method, any time the key's value is set, your observer
will be notified. Note that the observers are triggered any time the
value is set, regardless of whether it has actually changed. Your
observer should be prepared to handle that.

There are two common invocation patterns for `.addObserver()`:

- Passing two arguments:
  - the name of the property to observe (as a string)
  - the function to invoke (an actual function)
- Passing three arguments:
  - the name of the property to observe (as a string)
  - the target object (will be used to look up and invoke a
    function on)
  - the name of the function to invoke on the target object
    (as a string).

```app/components/my-component.js
import Component from '@ember/component';

export default Component.extend({
  init() {
    this._super(...arguments);

    // the following are equivalent:

    // using three arguments
    this.addObserver('foo', this, 'fooDidChange');

    // using two arguments
    this.addObserver('foo', (...args) => {
      this.fooDidChange(...args);
    });
  },

  fooDidChange() {
    // your custom logic code
  }
});
```

### Observer Methods

Observer methods have the following signature:

```app/components/my-component.js
import Component from '@ember/component';

export default Component.extend({
  init() {
    this._super(...arguments);
    this.addObserver('foo', this, 'fooDidChange');
  },

  fooDidChange(sender, key, value, rev) {
    // your code
  }
});
```

The `sender` is the object that changed. The `key` is the property that
changes. The `value` property is currently reserved and unused. The `rev`
is the last property revision of the object when it changed, which you can
use to detect if the key value has really changed or not.

Usually you will not need the value or revision parameters at
the end. In this case, it is common to write observer methods that take
only a sender and key value as parameters or, if you aren't interested in
any of these values, to write an observer that has no parameters at all.

While observers are still supported, there are [plans to deprecate them](https://github.com/emberjs/rfcs/pull/1115)
See the [in-progress deprecation guide](https://github.com/ember-learn/deprecation-app/pull/1407)
for guidance on how to avoid using observers.

##### Type Parameters

###### Target

`Target`

##### Parameters

###### key

keyof `UseHotkey`

The key to observe

###### target

`Target`

The target object to invoke

###### method

`ObserverMethod`\<`Target`, `UseHotkey`\>

The method to invoke

##### Returns

`this`

##### Method

addObserver

##### Inherited from

```ts
Helper.addObserver
```

#### Call Signature

```ts
addObserver(key, method): this;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:323

##### Parameters

###### key

keyof `UseHotkey`

###### method

`ObserverMethod`\<`UseHotkey`, `UseHotkey`\>

##### Returns

`this`

##### Inherited from

```ts
Helper.addObserver
```

***

### cacheFor()

```ts
cacheFor<K>(key): unknown;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:394

Returns the cached value of a computed property, if it exists.
This allows you to inspect the value of a computed property
without accidentally invoking it if it is intended to be
generated lazily.

#### Type Parameters

##### K

`K` *extends* keyof `UseHotkey`

#### Parameters

##### key

`K`

#### Returns

`unknown`

The cached value of the computed property, if any

#### Method

cacheFor

#### Inherited from

```ts
Helper.cacheFor
```

***

### compute()

```ts
compute(positional, options): void;
```

Defined in: packages/ember-hotkeys/src/useHotkey.ts:28

Override this function when writing a class-based helper.

#### Parameters

##### positional

\[`RegisterableHotkey`, `HotkeyCallback`\]

The positional arguments to the helper

##### options

`HotkeyOptions`

#### Returns

`void`

#### Method

compute

#### Since

1.13.0

#### Overrides

```ts
Helper.compute
```

***

### decrementProperty()

```ts
decrementProperty(keyName, decrement?): number;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:368

Set the value of a property to the current value minus some amount.

```javascript
player.decrementProperty('lives');
orc.decrementProperty('health', 5);
```

#### Parameters

##### keyName

keyof `UseHotkey`

The name of the property to decrement

##### decrement?

`number`

The amount to decrement by. Defaults to 1

#### Returns

`number`

The new property value

#### Method

decrementProperty

#### Inherited from

```ts
Helper.decrementProperty
```

***

### destroy()

```ts
destroy(): this;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:298

Destroys an object by setting the `isDestroyed` flag and removing its
metadata, which effectively destroys observers and bindings.

If you try to set a property on a destroyed object, an exception will be
raised.

Note that destruction is scheduled for the end of the run loop and does not
happen immediately.  It will set an isDestroying flag immediately.

#### Returns

`this`

receiver

#### Method

destroy

#### Inherited from

```ts
Helper.destroy
```

***

### get()

#### Call Signature

```ts
get<K>(key): UseHotkey[K];
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:119

Retrieves the value of a property from the object.

This method is usually similar to using `object[keyName]` or `object.keyName`,
however it supports both computed properties and the unknownProperty
handler.

Because `get` unifies the syntax for accessing all these kinds
of properties, it can make many refactorings easier, such as replacing a
simple property with a computed property, or vice versa.

### Computed Properties

Computed properties are methods defined with the `property` modifier
declared at the end, such as:

```javascript
import { computed } from '@ember/object';

fullName: computed('firstName', 'lastName', function() {
  return this.get('firstName') + ' ' + this.get('lastName');
})
```

When you call `get` on a computed property, the function will be
called and the return value will be returned instead of the function
itself.

### Unknown Properties

Likewise, if you try to call `get` on a property whose value is
`undefined`, the `unknownProperty()` method will be called on the object.
If this method returns any value other than `undefined`, it will be returned
instead. This allows you to implement "virtual" properties that are
not defined upfront.

##### Type Parameters

###### K

`K` *extends* keyof `UseHotkey`

##### Parameters

###### key

`K`

##### Returns

`UseHotkey`\[`K`\]

The property value or undefined.

##### Method

get

##### Inherited from

```ts
Helper.get
```

#### Call Signature

```ts
get(key): unknown;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:120

##### Parameters

###### key

`string`

##### Returns

`unknown`

##### Inherited from

```ts
Helper.get
```

***

### getProperties()

#### Call Signature

```ts
getProperties<L>(list): { [Key in keyof useHotkey]: useHotkey[Key] };
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:142

To get the values of multiple properties at once, call `getProperties`
with a list of strings or an array:

```javascript
record.getProperties('firstName', 'lastName', 'zipCode');
// { firstName: 'John', lastName: 'Doe', zipCode: '10011' }
```

is equivalent to:

```javascript
record.getProperties(['firstName', 'lastName', 'zipCode']);
// { firstName: 'John', lastName: 'Doe', zipCode: '10011' }
```

##### Type Parameters

###### L

`L` *extends* keyof `UseHotkey`[]

##### Parameters

###### list

`L`

of keys to get

##### Returns

`{ [Key in keyof useHotkey]: useHotkey[Key] }`

##### Method

getProperties

##### Inherited from

```ts
Helper.getProperties
```

#### Call Signature

```ts
getProperties<L>(...list): { [Key in keyof useHotkey]: useHotkey[Key] };
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:145

##### Type Parameters

###### L

`L` *extends* keyof `UseHotkey`[]

##### Parameters

###### list

...`L`

##### Returns

`{ [Key in keyof useHotkey]: useHotkey[Key] }`

##### Inherited from

```ts
Helper.getProperties
```

#### Call Signature

```ts
getProperties<L>(list): { [Key in string]: unknown };
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:148

##### Type Parameters

###### L

`L` *extends* `string`[]

##### Parameters

###### list

`L`

##### Returns

`{ [Key in string]: unknown }`

##### Inherited from

```ts
Helper.getProperties
```

#### Call Signature

```ts
getProperties<L>(...list): { [Key in string]: unknown };
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:151

##### Type Parameters

###### L

`L` *extends* `string`[]

##### Parameters

###### list

...`L`

##### Returns

`{ [Key in string]: unknown }`

##### Inherited from

```ts
Helper.getProperties
```

***

### incrementProperty()

```ts
incrementProperty(keyName, increment?): number;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:353

Set the value of a property to the current value plus some amount.

```javascript
person.incrementProperty('age');
team.incrementProperty('score', 2);
```

#### Parameters

##### keyName

keyof `UseHotkey`

The name of the property to increment

##### increment?

`number`

The amount to increment by. Defaults to 1

#### Returns

`number`

The new property value

#### Method

incrementProperty

#### Inherited from

```ts
Helper.incrementProperty
```

***

### init()

```ts
init(properties): void;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/-internals/glimmer/lib/helper.d.ts:105

An overridable method called when objects are instantiated. By default,
does nothing unless it is overridden during class definition.

Example:

```javascript
import EmberObject from '@ember/object';

const Person = EmberObject.extend({
  init() {
    alert(`Name is ${this.get('name')}`);
  }
});

let steve = Person.create({
  name: 'Steve'
});

// alerts 'Name is Steve'.
```

NOTE: If you do override `init` for a framework class like `Component`
from `@ember/component`, be sure to call `this._super(...arguments)`
in your `init` declaration!
If you don't, Ember may not have an opportunity to
do important setup work, and you'll see strange behavior in your
application.

#### Parameters

##### properties

`object` \| `undefined`

#### Returns

`void`

#### Method

init

#### Inherited from

```ts
Helper.init
```

***

### notifyPropertyChange()

```ts
notifyPropertyChange(keyName): this;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:234

Convenience method to call `propertyWillChange` and `propertyDidChange` in
succession.

Notify the observer system that a property has just changed.

Sometimes you need to change a value directly or indirectly without
actually calling `get()` or `set()` on it. In this case, you can use this
method instead. Calling this method will notify all observers that the
property has potentially changed value.

#### Parameters

##### keyName

`string`

The property key to be notified about.

#### Returns

`this`

#### Method

notifyPropertyChange

#### Inherited from

```ts
Helper.notifyPropertyChange
```

***

### recompute()

```ts
recompute(): void;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/-internals/glimmer/lib/helper.d.ts:142

On a class-based helper, it may be useful to force a recomputation of that
helpers value. This is akin to `rerender` on a component.

In most cases, `recompute` is not needed because accessing tracked
properties in `compute` will automatically re-run the helper when
those properties change. Use `recompute` only when you need to
trigger a recomputation imperatively, for example in response to an
external event:

```app/helpers/current-time.js
import Helper from '@ember/component/helper';

export default class CurrentTimeHelper extends Helper {
  interval = null;

  compute() {
    return new Date().toLocaleTimeString();
  }

  constructor() {
    super(...arguments);
    this.interval = setInterval(() => this.recompute(), 1000);
  }

  willDestroy() {
    super.willDestroy();
    clearInterval(this.interval);
  }
}
```

#### Returns

`void`

#### Method

recompute

#### Since

1.13.0

#### Inherited from

```ts
Helper.recompute
```

***

### removeObserver()

#### Call Signature

```ts
removeObserver<Target>(
   key,
   target,
   method): this;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:337

Remove an observer you have previously registered on this object. Pass
the same key, target, and method you passed to `addObserver()` and your
target will no longer receive notifications.

##### Type Parameters

###### Target

`Target`

##### Parameters

###### key

keyof `UseHotkey`

The key to observe

###### target

`Target`

The target object to invoke

###### method

`ObserverMethod`\<`Target`, `UseHotkey`\>

The method to invoke

##### Returns

`this`

##### Method

removeObserver

##### Inherited from

```ts
Helper.removeObserver
```

#### Call Signature

```ts
removeObserver(key, method): this;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:338

##### Parameters

###### key

keyof `UseHotkey`

###### method

`ObserverMethod`\<`UseHotkey`, `UseHotkey`\>

##### Returns

`this`

##### Inherited from

```ts
Helper.removeObserver
```

***

### reopen()

```ts
reopen(...args): this;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:79

#### Parameters

##### args

...(`Record`\<`string`, `unknown`\> \| `Mixin`)[]

#### Returns

`this`

#### Inherited from

```ts
Helper.reopen
```

***

### set()

#### Call Signature

```ts
set<K, T>(key, value): T;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:198

Sets the provided key or path to the value.

```javascript
record.set("key", value);
```

This method is generally very similar to calling `object["key"] = value` or
`object.key = value`, except that it provides support for computed
properties, the `setUnknownProperty()` method and property observers.

### Computed Properties

If you try to set a value on a key that has a computed property handler
defined (see the `get()` method for an example), then `set()` will call
that method, passing both the value and key instead of simply changing
the value itself. This is useful for those times when you need to
implement a property that is composed of one or more member
properties.

### Unknown Properties

If you try to set a value on a key that is undefined in the target
object, then the `setUnknownProperty()` handler will be called instead. This
gives you an opportunity to implement complex "virtual" properties that
are not predefined on the object. If `setUnknownProperty()` returns
undefined, then `set()` will simply set the value on the object.

### Property Observers

In addition to changing the property, `set()` will also register a property
change with the object. Unless you have placed this call inside of a
`beginPropertyChanges()` and `endPropertyChanges(),` any "local" observers
(i.e. observer methods declared on the same object), will be called
immediately. Any "remote" observers (i.e. observer methods declared on
another object) will be placed in a queue and called at a later time in a
coalesced manner.

##### Type Parameters

###### K

`K` *extends* keyof `UseHotkey`

###### T

`T` *extends*
  \| `string`
  \| `boolean`
  \| `unknown`[]
  \| `string`[]
  \| ((...`args`) => `void`)
  \| ((`positional`, `options`) => `void`)
  \| `Owner`
  \| ((`properties`) => `void`)
  \| (() => `void`)
  \| `DirtyableTag`
  \| ((...`args`) => `this`)
  \| (() => `this`)
  \| (\{
\<`K`\>  (`key`): `UseHotkey`\[`K`\];
  (`key`): `unknown`;
\})
  \| (\{
\<`L`\>  (`list`): `{ [Key in keyof useHotkey]: useHotkey[Key] }`;
\<`L`\>  (...`list`): `{ [Key in keyof useHotkey]: useHotkey[Key] }`;
\<`L`\>  (`list`): `{ [Key in string]: unknown }`;
\<`L`\>  (...`list`): `{ [Key in string]: unknown }`;
\})
  \| (\{
\<`K`, `T`\>  (`key`, `value`): `T`;
\<`T`\>  (`key`, `value`): `T`;
\})
  \| (\{
\<`K`, `P`\>  (`hash`): `P`;
\<`T`\>  (`hash`): `T`;
\})
  \| ((`keyName`) => `this`)
  \| (\{
\<`Target`\>  (`key`, `target`, `method`): `this`;
  (`key`, `method`): `this`;
\})
  \| (\{
\<`Target`\>  (`key`, `target`, `method`): `this`;
  (`key`, `method`): `this`;
\})
  \| ((`keyName`, `increment?`) => `number`)
  \| ((`keyName`, `decrement?`) => `number`)
  \| ((`keyName`) => `boolean`)
  \| (\<`K`\>(`key`) => `unknown`)
  \| ((...`args`) => `any`)
  \| (() => `void`)
  \| (() => `string`)
  \| `undefined`

##### Parameters

###### key

`K`

###### value

`T`

The value to set or `null`.

##### Returns

`T`

The passed value

##### Method

set

##### Inherited from

```ts
Helper.set
```

#### Call Signature

```ts
set<T>(key, value): T;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:199

##### Type Parameters

###### T

`T`

##### Parameters

###### key

`string`

###### value

`T`

##### Returns

`T`

##### Inherited from

```ts
Helper.set
```

***

### setProperties()

#### Call Signature

```ts
setProperties<K, P>(hash): P;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:214

Sets a list of properties at once. These properties are set inside
a single `beginPropertyChanges` and `endPropertyChanges` batch, so
observers will be buffered.

```javascript
record.setProperties({ firstName: 'Charles', lastName: 'Jolley' });
```

##### Type Parameters

###### K

`K` *extends* keyof `UseHotkey`

###### P

`P` *extends* `{ [Key in keyof useHotkey]: useHotkey[Key] }`

##### Parameters

###### hash

`P`

the hash of keys and values to set

##### Returns

`P`

The passed in hash

##### Method

setProperties

##### Inherited from

```ts
Helper.setProperties
```

#### Call Signature

```ts
setProperties<T>(hash): T;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:217

##### Type Parameters

###### T

`T` *extends* `Record`\<`string`, `unknown`\>

##### Parameters

###### hash

`T`

##### Returns

`T`

##### Inherited from

```ts
Helper.setProperties
```

***

### toggleProperty()

```ts
toggleProperty(keyName): boolean;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/observable.d.ts:382

Set the value of a boolean property to the opposite of its
current value.

```javascript
starship.toggleProperty('warpDriveEngaged');
```

#### Parameters

##### keyName

keyof `UseHotkey`

The name of the property to toggle

#### Returns

`boolean`

The new property value

#### Method

toggleProperty

#### Inherited from

```ts
Helper.toggleProperty
```

***

### toString()

```ts
toString(): string;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:345

Returns a string representation which attempts to provide more information
than Javascript's `toString` typically does, in a generic way for all Ember
objects.

```javascript
import EmberObject from '@ember/object';

const Person = EmberObject.extend();
person = Person.create();
person.toString(); //=> "<Person:ember1024>"
```

If the object's class is not defined on an Ember namespace, it will
indicate it is a subclass of the registered superclass:

```javascript
const Student = Person.extend();
let student = Student.create();
student.toString(); //=> "<(subclass of Person):ember1025>"
```

If the method `toStringExtension` is defined, its return value will be
included in the output.

```javascript
const Teacher = Person.extend({
  toStringExtension() {
    return this.get('fullName');
  }
});
teacher = Teacher.create();
teacher.toString(); //=> "<Teacher:ember1026:Tom Dale>"
```

#### Returns

`string`

string representation

#### Method

toString

#### Inherited from

```ts
Helper.toString
```

***

### willDestroy()

```ts
willDestroy(): void;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:305

Override to implement teardown.

#### Returns

`void`

#### Method

willDestroy

#### Inherited from

```ts
Helper.willDestroy
```

***

### applyPartial()

```ts
static applyPartial(obj): Record<string, any>;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/mixin.d.ts:145

**`Internal`**

#### Parameters

##### obj

`object`

#### Returns

`Record`\<`string`, `any`\>

#### Inherited from

```ts
Helper.applyPartial
```

***

### create()

#### Call Signature

```ts
readonly static create<C>(this): InstanceType<C>;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:482

Creates an instance of a class. Accepts either no arguments, or an object
containing values to initialize the newly instantiated object with.

```javascript
import EmberObject from '@ember/object';

const Person = EmberObject.extend({
  helloWorld() {
    alert(`Hi, my name is ${this.get('name')}`);
  }
});

let tom = Person.create({
  name: 'Tom Dale'
});

tom.helloWorld(); // alerts "Hi, my name is Tom Dale".
```

`create` will call the `init` function if defined during
`AnyObject.extend`

If no arguments are passed to `create`, it will not set values to the new
instance during initialization:

```javascript
let noName = Person.create();
noName.helloWorld(); // alerts undefined
```

NOTE: For performance reasons, you cannot declare methods or computed
properties during `create`. You should instead declare methods and computed
properties when using `extend`.

##### Type Parameters

###### C

`C` *extends* *typeof* `CoreObject`

##### Parameters

###### this

`C`

##### Returns

`InstanceType`\<`C`\>

##### Method

create

##### For

@ember/object

##### Static

##### Inherited from

```ts
Helper.create
```

#### Call Signature

```ts
readonly static create<C, I, K, Args>(this, ...args): InstanceType<C> & MergeArray<Args>;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:483

Creates an instance of a class. Accepts either no arguments, or an object
containing values to initialize the newly instantiated object with.

```javascript
import EmberObject from '@ember/object';

const Person = EmberObject.extend({
  helloWorld() {
    alert(`Hi, my name is ${this.get('name')}`);
  }
});

let tom = Person.create({
  name: 'Tom Dale'
});

tom.helloWorld(); // alerts "Hi, my name is Tom Dale".
```

`create` will call the `init` function if defined during
`AnyObject.extend`

If no arguments are passed to `create`, it will not set values to the new
instance during initialization:

```javascript
let noName = Person.create();
noName.helloWorld(); // alerts undefined
```

NOTE: For performance reasons, you cannot declare methods or computed
properties during `create`. You should instead declare methods and computed
properties when using `extend`.

##### Type Parameters

###### C

`C` *extends* *typeof* `CoreObject`

###### I

`I` *extends* `CoreObject`

###### K

`K` *extends* `string` \| `number` \| `symbol`

###### Args

`Args` *extends* `Partial`\<\{ \[Key in string \| number \| symbol\]: I\[Key\] \}\>[]

##### Parameters

###### this

`C`

###### args

...`Args`

##### Returns

`InstanceType`\<`C`\> & `MergeArray`\<`Args`\>

##### Method

create

##### For

@ember/object

##### Static

##### Inherited from

```ts
Helper.create
```

***

### detectInstance()

```ts
readonly static detectInstance(obj): obj is CoreObject;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:585

#### Parameters

##### obj

`unknown`

#### Returns

`obj is CoreObject`

#### Inherited from

```ts
Helper.detectInstance
```

***

### extend()

```ts
readonly static extend<Statics, Instance, M>(this, ...mixins?): Readonly<Statics> & EmberClassConstructor<Instance> & MergeArray<M>;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:440

Creates a new subclass.

```javascript
import EmberObject from '@ember/object';

const Person = EmberObject.extend({
  say(thing) {
    alert(thing);
   }
});
```

This defines a new subclass of EmberObject: `Person`. It contains one method: `say()`.

You can also create a subclass from any existing class by calling its `extend()` method.
For example, you might want to create a subclass of Ember's built-in `Component` class:

```javascript
import Component from '@ember/component';

const PersonComponent = Component.extend({
  tagName: 'li',
  classNameBindings: ['isAdministrator']
});
```

When defining a subclass, you can override methods but still access the
implementation of your parent class by calling the special `_super()` method:

```javascript
import EmberObject from '@ember/object';

const Person = EmberObject.extend({
  say(thing) {
    let name = this.get('name');
    alert(`${name} says: ${thing}`);
  }
});

const Soldier = Person.extend({
  say(thing) {
    this._super(`${thing}, sir!`);
  },
  march(numberOfHours) {
    alert(`${this.get('name')} marches for ${numberOfHours} hours.`);
  }
});

let yehuda = Soldier.create({
  name: 'Yehuda Katz'
});

yehuda.say('Yes');  // alerts "Yehuda Katz says: Yes, sir!"
```

The `create()` on line #17 creates an *instance* of the `Soldier` class.
The `extend()` on line #8 creates a *subclass* of `Person`. Any instance
of the `Person` class will *not* have the `march()` method.

You can also pass `Mixin` classes to add additional properties to the subclass.

```javascript
import EmberObject from '@ember/object';
import Mixin from '@ember/object/mixin';

const Person = EmberObject.extend({
  say(thing) {
    alert(`${this.get('name')} says: ${thing}`);
  }
});

const SingingMixin = Mixin.create({
  sing(thing) {
    alert(`${this.get('name')} sings: la la la ${thing}`);
  }
});

const BroadwayStar = Person.extend(SingingMixin, {
  dance() {
    alert(`${this.get('name')} dances: tap tap tap tap `);
  }
});
```

The `BroadwayStar` class contains three methods: `say()`, `sing()`, and `dance()`.

#### Type Parameters

##### Statics

`Statics`

##### Instance

`Instance`

##### M

`M` *extends* `unknown`[]

#### Parameters

##### this

`Statics` & `EmberClassConstructor`\<`Instance`\>

##### mixins?

...`M`

One or more Mixin classes

#### Returns

`Readonly`\<`Statics`\> & `EmberClassConstructor`\<`Instance`\> & `MergeArray`\<`M`\>

#### Method

extend

#### Static

#### For

@ember/object

#### Inherited from

```ts
Helper.extend
```

***

### keys()

```ts
static keys(): Set<string>;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/mixin.d.ts:157

**`Internal`**

#### Returns

`Set`\<`string`\>

#### Inherited from

```ts
Helper.keys
```

***

### proto()

```ts
readonly static proto(): CoreObject;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:631

#### Returns

`CoreObject`

#### Inherited from

```ts
Helper.proto
```

***

### reopenClass()

```ts
readonly static reopenClass<C>(this, ...mixins): C;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:583

Augments a constructor's own properties and functions:

```javascript
import EmberObject from '@ember/object';

const MyObject = EmberObject.extend({
  name: 'an object'
});

MyObject.reopenClass({
  canBuild: false
});

MyObject.canBuild; // false
o = MyObject.create();
```

In other words, this creates static properties and functions for the class.
These are only available on the class and not on any instance of that class.

```javascript
import EmberObject from '@ember/object';

const Person = EmberObject.extend({
  name: '',
  sayHello() {
    alert(`Hello. My name is ${this.get('name')}`);
  }
});

Person.reopenClass({
  species: 'Homo sapiens',

  createPerson(name) {
    return Person.create({ name });
  }
});

let tom = Person.create({
  name: 'Tom Dale'
});
let yehuda = Person.createPerson('Yehuda Katz');

tom.sayHello(); // "Hello. My name is Tom Dale"
yehuda.sayHello(); // "Hello. My name is Yehuda Katz"
alert(Person.species); // "Homo sapiens"
```

Note that `species` and `createPerson` are *not* valid on the `tom` and `yehuda`
variables. They are only valid on `Person`.

To add functions and properties to instances of
a constructor by extending the constructor's prototype
see `reopen`

#### Type Parameters

##### C

`C` *extends* *typeof* `CoreObject`

#### Parameters

##### this

`C`

##### mixins

...(`Record`\<`string`, `unknown`\> \| `Mixin`)[]

#### Returns

`C`

#### Method

reopenClass

#### For

@ember/object

#### Static

#### Inherited from

```ts
Helper.reopenClass
```

***

### toString()

```ts
static toString(): string;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:632

#### Returns

`string`

#### Inherited from

```ts
Helper.toString
```

***

### willReopen()

```ts
readonly static willReopen(): void;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/core.d.ts:521

#### Returns

`void`

#### Inherited from

```ts
Helper.willReopen
```

***

### without()

```ts
static without(...args): Mixin;
```

Defined in: node\_modules/.pnpm/ember-source@7.3.0\_@glimmer+component@2.1.1\_supports-color@8.1.1\_\_supports-color@8.1.1/node\_modules/ember-source/types/stable/@ember/object/mixin.d.ts:155

**`Internal`**

#### Parameters

##### args

...`any`[]

#### Returns

`Mixin`

#### Inherited from

```ts
Helper.without
```
