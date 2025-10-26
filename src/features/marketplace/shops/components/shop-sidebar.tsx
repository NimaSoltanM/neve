import { AppSidebar } from '@/features/shared/layout/components/app-sidebar'
import { useI18n } from '@/features/shared/i18n'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  Store,
  ArrowLeft,
  Tags,
  DollarSign,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getMyShop } from '../actions'

export function ShopSidebar() {
  const { t } = useI18n()

  const { data: shop, isLoading } = useQuery({
    queryKey: ['shop'],
    queryFn: async () => {
      return getMyShop()
    },
  })

  const sidebarItems = [
    {
      title: t('shop.management'),
      items: [
        {
          title: t('shop.overview'),
          href: '/shop',
          icon: LayoutDashboard,
        },
        {
          title: t('shop.products'),
          href: '/shop/products',
          icon: Package,
          children: [
            {
              title: t('shop.allProducts'),
              href: '/shop/products',
            },
            {
              title: t('shop.addProduct'),
              href: '/shop/products/new',
            },
          ],
        },
        {
          title: t('shop.orders'),
          href: '/shop/orders',
          icon: ShoppingBag,
          badge: 5,
        },
        {
          title: t('shop.auctions'),
          href: '/shop/auctions',
          icon: Tags,
        },
      ],
    },
    {
      title: t('shop.insights'),
      items: [
        {
          title: t('shop.analytics'),
          href: '/shop/analytics',
          icon: BarChart3,
        },
      ],
    },
    {
      title: t('shop.configuration'),
      items: [
        {
          title: t('shop.settings'),
          href: '/shop/settings',
          icon: Settings,
        },
        {
          title: t('shop.viewStorefront'),
          href: `/shops/${shop?.data?.slug}`,
          icon: Store,
          external: true,
          isLoading,
        },
      ],
    },
  ]

  const footer = (
    <div className="p-2">
      <Button variant="outline" className="w-full justify-start" asChild>
        <Link to="/dashboard">
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" />
          {t('nav.backToDashboard')}
        </Link>
      </Button>
    </div>
  )

  return <AppSidebar items={sidebarItems} footer={footer} />
}
