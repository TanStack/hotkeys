import { HotkeyManager } from '@tanstack/hotkeys'
import { useStyles } from '../styles/use-styles'
import type { HotkeyRegistrationView } from '@tanstack/hotkeys'

type ActionButtonsProps = {
  registration: HotkeyRegistrationView
}

export function ActionButtons(props: ActionButtonsProps) {
  const styles = useStyles()

  const handleTrigger = () => {
    HotkeyManager.getInstance().triggerRegistration(props.registration.id)
  }

  return (
    <div class={styles().actionsRow}>
      <button class={styles().actionButton} onMouseDown={handleTrigger}>
        <span class={styles().actionDotGreen} />
        Trigger
      </button>
    </div>
  )
}
