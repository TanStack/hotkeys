import { action } from '@ember/object'
import Component from '@glimmer/component'
import { tracked } from '@glimmer/tracking'
import {
  useFormatForDisplay,
  useHeldKeys,
  useHotkeyHint,
  useKeyHold,
} from '@tanstack/ember-hotkeys'

export default class Probe extends Component {
  @tracked count = 0
  held = useHeldKeys(this)
  hold = useKeyHold(this, 'Control')
  hint = useHotkeyHint(this, 'Control+S')
  formatForDisplay = useFormatForDisplay()

  get heldText() {
    return this.held.value.join(',')
  }

  @action save() {
    this.count++
  }
}
