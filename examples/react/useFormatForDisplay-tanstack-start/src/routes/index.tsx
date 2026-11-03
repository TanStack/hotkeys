import { createFileRoute } from '@tanstack/react-router'
import { CheatSheetPage } from '../CheatSheetPage'

export const Route = createFileRoute('/')({
  component: CheatSheetPage,
})
