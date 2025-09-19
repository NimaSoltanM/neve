import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '@/features/auth/actions/get-current-user.action'
import { SidebarProvider } from '@/components/ui/sidebar'
import { ShopSidebar } from '@/features/shop/components/shop-sidebar'
import { Header } from '@/features/shared/layout/components/header'
import { useI18n } from '@/features/shared/i18n'
import { getMyShop } from '@/features/marketplace/shops/actions'

export const Route = createFileRoute('/(root)/(marketplace)/shop')({
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

    // Check if user has a shop
    const shop = await getMyShop()

    if (!shop) {
      // Redirect to shop creation if no shop exists
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
