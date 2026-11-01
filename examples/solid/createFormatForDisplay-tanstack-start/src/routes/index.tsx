import { createFileRoute } from '@tanstack/solid-router'
import { CheatSheetPage } from '../CheatSheetPage'

export const Route = createFileRoute('/')({
  component: CheatSheetPage,
})
