import { z } from 'zod'

export const shopStatsSchema = z.object({
  todaySales: z.string(),
  weekSales: z.string(),
  monthSales: z.string(),
  totalRevenue: z.string(),
  totalProducts: z.number(),
  activeAuctions: z.number(),
  pendingOrders: z.number(),
})

export const recentShopOrderSchema = z.object({
  id: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  itemsCount: z.number(),
  totalAmount: z.string(),
  status: z.enum(['pending', 'paid', 'completed', 'cancelled']),
  createdAt: z.date(),
})

export const topProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string().nullable(),
  sales: z.number(),
  views: z.number(),
  stock: z.number(),
  revenue: z.string(),
})

export const lowStockProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  image: z.string().nullable(),
  stock: z.number(),
  threshold: z.number(),
})

export const shopDashboardDataSchema = z.object({
  stats: shopStatsSchema,
  recentOrders: z.array(recentShopOrderSchema),
  topProducts: z.array(topProductSchema),
  lowStockProducts: z.array(lowStockProductSchema),
})

export type ShopStats = z.infer<typeof shopStatsSchema>
export type RecentShopOrder = z.infer<typeof recentShopOrderSchema>
export type TopProduct = z.infer<typeof topProductSchema>
export type LowStockProduct = z.infer<typeof lowStockProductSchema>
export type ShopDashboardData = z.infer<typeof shopDashboardDataSchema>
