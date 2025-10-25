import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '@/features/auth/actions/get-current-user.action'
import { getAnalyticsData } from '@/features/analytics/actions/get-analytics-data.action'
import { useI18n } from '@/features/shared/i18n'
import { z } from 'zod'
import { KPICard } from '@/features/analytics/components/kpi-card'
import { RevenueChart } from '@/features/analytics/components/revenue-chart'
import { TopProductsTable } from '@/features/analytics/components/top-products-table'
import { PeriodSelector } from '@/features/analytics/components/period-selector'
import { RawDataModal } from '@/features/analytics/components/raw-data-modal'
import { AnalyticsInfoAlert } from '@/features/analytics/components/analytics-info-alert'
import { generateDemoAnalyticsData } from '@/features/analytics/utils/demo-data'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DollarSign, ShoppingCart, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const searchSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
  mode: z.enum(['demo', 'real']).default('demo'),
})

type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y'

export const Route = createFileRoute('/(dashboards)/shop/analytics/')({
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const { isAuthenticated } = await getCurrentUser()
    if (!isAuthenticated) {
      throw redirect({
        to: '/auth',
        search: { callbackUrl: '/shop/analytics' },
      })
    }
  },
  loaderDeps: ({ search }) => ({ search }),
  loader: async ({ deps }) => {
    if (deps.search.mode === 'real') {
      const result = await getAnalyticsData({
        data: { period: deps.search.period },
      })
      return result
    }
    return null
  },
  component: AnalyticsPage,
})

function AnalyticsPage() {
  const { t, dir } = useI18n()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const loaderData = Route.useLoaderData()

  const isDemo = search.mode === 'demo'
  const analyticsData = isDemo
    ? generateDemoAnalyticsData(search.period)
    : loaderData?.success
      ? loaderData.data
      : null

  const handlePeriodChange = (period: AnalyticsPeriod) => {
    navigate({ search: { ...search, period } })
  }

  const handleModeChange = (mode: string) => {
    navigate({ search: { ...search, mode: mode as 'demo' | 'real' } })
  }

  if (!analyticsData) {
    return (
      <div dir={dir} className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">{t('analytics.noData')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { overview, revenueTimeSeries, topProducts } = analyticsData

  return (
    <div dir={dir} className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('analytics.title')}</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <PeriodSelector value={search.period} onChange={handlePeriodChange} />
          <RawDataModal data={analyticsData} />
        </div>
      </div>

      {/* Mode Tabs */}
      <Tabs value={search.mode} onValueChange={handleModeChange}>
        <TabsList>
          <TabsTrigger value="demo">{t('analytics.demoMode')}</TabsTrigger>
          <TabsTrigger value="real">{t('analytics.realMode')}</TabsTrigger>
        </TabsList>

        <TabsContent value={search.mode} className="space-y-6 mt-6">
          {/* Info Alert */}
          <AnalyticsInfoAlert isDemo={isDemo} />

          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <KPICard
              title={t('analytics.totalRevenue')}
              value={overview.totalRevenue}
              isPrice={true}
              change={{
                value: overview.revenueChange,
                trend: overview.revenueChange >= 0 ? 'up' : 'down',
              }}
              icon={DollarSign}
            />
            <KPICard
              title={t('analytics.totalOrders')}
              value={overview.totalOrders}
              change={{
                value: overview.ordersChange,
                trend: overview.ordersChange >= 0 ? 'up' : 'down',
              }}
              icon={ShoppingCart}
            />
            <KPICard
              title={t('analytics.averageOrderValue')}
              value={overview.averageOrderValue}
              isPrice={true}
              change={{
                value: overview.aovChange,
                trend: overview.aovChange >= 0 ? 'up' : 'down',
              }}
              icon={TrendingUp}
            />
          </div>

          {/* Revenue Chart */}
          <RevenueChart
            data={revenueTimeSeries}
            title={t('analytics.revenueOverTime')}
          />

          {/* Top Products Table */}
          <TopProductsTable
            products={topProducts}
            title={t('analytics.topProducts')}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
