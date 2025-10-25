export interface KPIMetric {
  label: string
  value: string | number
  change?: {
    value: number // percentage
    trend: 'up' | 'down'
  }
  icon?: string // lucide icon name
}

export interface RevenueDataPoint {
  date: string // ISO date string
  revenue: string // decimal string for precision
  orderCount: number
}

export interface TopProduct {
  productId: number
  productName: string
  productSlug: string
  productImage?: string
  totalRevenue: string
  unitsSold: number
  orderCount: number
}

export interface VendorPerformance {
  shopId: number
  shopName: string
  shopSlug: string
  totalRevenue: string
  orderCount: number
  productsSold: number
  averageOrderValue: string
}

export interface AuctionStats {
  totalAuctions: number
  activeAuctions: number
  completedAuctions: number
  completionRate: number // percentage
  averageWinningBid: string
  totalAuctionRevenue: string
}

export interface DateRangeFilter {
  from: Date
  to: Date
}

export type PeriodType = '7d' | '30d' | '90d' | '1y' | 'custom'

export interface AnalyticsFilters {
  period: PeriodType
  dateRange?: DateRangeFilter
  shopId?: number // For filtering by specific vendor (admin view)
}

// Response types
export interface AnalyticsOverview {
  totalRevenue: string
  totalOrders: number
  averageOrderValue: string
  conversionRate?: number // optional, for future implementation

  // Period comparisons (vs previous period)
  revenueChange: number // percentage
  ordersChange: number // percentage
  aovChange: number // percentage
}

export interface AnalyticsDashboardData {
  overview: AnalyticsOverview
  revenueTimeSeries: RevenueDataPoint[]
  topProducts: TopProduct[]
  vendorPerformance?: VendorPerformance[] // Only for admin/platform view
  auctionStats?: AuctionStats // Optional auction metrics
}

// For search params validation
export interface AnalyticsSearchParams {
  period?: PeriodType
  from?: string // ISO date
  to?: string // ISO date
  shopId?: number
}
