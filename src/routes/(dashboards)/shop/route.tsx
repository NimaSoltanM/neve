import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '@/features/auth/actions/get-current-user.action'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ShopSidebar } from '@/features/marketplace/shops/components/shop-sidebar'
import { Header } from '@/features/shared/layout/components/header'
import { useI18n } from '@/features/shared/i18n'
import { getMyShop } from '@/features/marketplace/shops/actions'

export const Route = createFileRoute('/(dashboards)/shop')({
  beforeLoad: async () => {
    const { isAuthenticated } = await getCurrentUser()

    if (!isAuthenticated) {
      throw redirect({
        to: '/auth',
        search: {
          callbackUrl: '/shop',
        },
      })
    }

    const shop = await getMyShop()

    if (!shop.data) {
      throw redirect({
        to: '/',
      })
    }
  },
  component: ShopLayout,
})

function ShopLayout() {
  const { dir } = useI18n()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full" dir={dir}>
        <ShopSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 container py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
