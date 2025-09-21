import { LanguageSwitcher } from '@/features/shared/i18n'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LanguageSwitcher />
}
