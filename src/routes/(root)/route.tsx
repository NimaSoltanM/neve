import { Outlet, createFileRoute } from '@tanstack/react-router'
import { Header } from '@/features/shared/layout/components/header'
import { useI18n } from '@/features/shared/i18n'
import { useAuctionChecker } from '@/features/marketplace/bids/hooks/use-auction-checker'
import { FloatingDock } from '@/features/shared/layout/components/floating-dock'

export const Route = createFileRoute('/(root)')({
  component: RootLayout,
})

function RootLayout() {
  const { dir } = useI18n()
  useAuctionChecker()

  return (
    <div className="min-h-screen flex flex-col" dir={dir}>
      <Header />
      <main className="flex-1">
        <Outlet />
        <FloatingDock />
      </main>
    </div>
  )
}
