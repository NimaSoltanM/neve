// src/features/dashboard/components/dashboard-sidebar.tsx
import { AppSidebar } from '@/features/shared/layout/components/app-sidebar'
import { useI18n } from '@/features/shared/i18n'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Home,
  Package,
  Gavel,
  Heart,
  User,
  Store,
  Plus,
  Settings,
  LogOut,
} from 'lucide-react'

export function DashboardSidebar() {
  const { t } = useI18n()
  const { logout } = useAuth()

  const sidebarItems = [
    {
      title: t('nav.main'),
      items: [
        {
          title: t('nav.overview'),
          href: '/dashboard',
          icon: Home,
        },
        {
          title: t('nav.orders'),
          href: '/dashboard/orders',
          icon: Package,
          badge: 2,
        },
        {
          title: t('nav.bids'),
          href: '/dashboard/bids',
          icon: Gavel,
        },
        {
          title: t('nav.wishlist'),
          href: '/dashboard/wishlist',
          icon: Heart,
        },
      ],
    },
    {
      title: t('nav.account'),
      items: [
        {
          title: t('nav.profile'),
          href: '/dashboard/profile',
          icon: User,
        },
        {
          title: t('nav.settings'),
          href: '/dashboard/settings',
          icon: Settings,
        },
      ],
    },
    {
      title: t('nav.selling'),
      items: [
        {
          title: t('nav.createShop'),
          href: '/dashboard/shop-setup',
          icon: Plus,
        },
        {
          title: t('nav.myShop'),
          href: '/shop',
          icon: Store,
          external: true,
        },
      ],
    },
  ]

  const footer = (
    <div className="p-2 space-y-2">
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => logout()}
      >
        <LogOut className="me-2 h-4 w-4" />
        {t('auth.logout')}
      </Button>
    </div>
  )

  return <AppSidebar items={sidebarItems} footer={footer} />
}
