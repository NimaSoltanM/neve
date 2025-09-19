// src/routes/(root).tsx
import { Header } from '@/features/shared/layout/components/header'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useI18n } from '@/features/shared/i18n'

export const Route = createFileRoute('/(root)')({
  component: RootLayout,
})

function RootLayout() {
  const { dir } = useI18n()

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
