import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '@/features/auth/actions/get-current-user.action'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { DashboardSidebar } from '@/features/dashboard/components/dashboard-sidebar'
import { Header } from '@/features/shared/layout/components/header'

export const Route = createFileRoute('/(dashboards)/dashboard')({
  beforeLoad: async () => {
    const { isAuthenticated, user, needsProfile } = await getCurrentUser()

    if (!isAuthenticated) {
      throw redirect({
        to: '/auth',
        search: {
          callbackUrl: '/dashboard',
        },
      })
    }

    if (needsProfile) {
      throw redirect({
        to: '/auth',
        search: {
          callbackUrl: '/dashboard',
        },
      })
    }

    return { user }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-[calc(100vh-4rem)] w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          {/* Mobile sidebar toggle */}
          <div className="flex items-center px-4 py-2 lg:hidden border-b">
            <SidebarTrigger />
          </div>
          <Header />
          <main className="flex-1 container py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
