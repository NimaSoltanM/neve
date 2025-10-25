import type { AnalyticsDashboardData } from '../types/analytics.types'

export function generateDemoAnalyticsData(
  period: '7d' | '30d' | '90d' | '1y',
): AnalyticsDashboardData {
  const days = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365,
  }[period]

  // Generate date range
  const dates: string[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }

  // Generate revenue time series with realistic variation
  const revenueTimeSeries = dates.map((date, index) => {
    const baseRevenue = 500 + Math.random() * 1500
    const trend = (index / dates.length) * 200 // Slight upward trend
    const dayOfWeek = new Date(date).getDay()
    const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1 // Weekend boost

    const revenue = (baseRevenue + trend) * weekendBoost
    const orderCount = Math.floor(5 + Math.random() * 15)

    return {
      date,
      revenue: revenue.toFixed(2),
      orderCount,
    }
  })

  // Calculate totals
  const totalRevenue = revenueTimeSeries.reduce(
    (sum, day) => sum + parseFloat(day.revenue),
    0,
  )
  const totalOrders = revenueTimeSeries.reduce(
    (sum, day) => sum + day.orderCount,
    0,
  )

  // Generate previous period comparison (simulate growth)
  const revenueChange = 5 + Math.random() * 20 // 5-25% growth
  const ordersChange = 3 + Math.random() * 15 // 3-18% growth
  const aovChange = -2 + Math.random() * 8 // -2% to +6% change

  // Generate top products
  const productNames = [
    'Premium Wireless Headphones',
    'Smart Watch Pro',
    'Laptop Stand Adjustable',
    'Mechanical Keyboard RGB',
    'USB-C Hub 7-in-1',
    'Webcam 4K HD',
    'External SSD 1TB',
    'Bluetooth Speaker',
    'Gaming Mouse',
    'Phone Case Premium',
  ]

  const topProducts = productNames.map((name, index) => {
    const revenue = 2000 - index * 150 + Math.random() * 300
    const unitsSold = Math.floor(20 + (10 - index) * 5 + Math.random() * 10)
    const orderCount = Math.floor(unitsSold * 0.8)

    return {
      productId: 1000 + index,
      productName: name,
      productSlug: name.toLowerCase().replace(/\s+/g, '-'),
      productImage: `https://placehold.co/400x400/e2e8f0/1e293b?text=${encodeURIComponent(name.split(' ')[0])}`,
      totalRevenue: revenue.toFixed(2),
      unitsSold,
      orderCount,
    }
  })

  return {
    overview: {
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders,
      averageOrderValue: (totalRevenue / totalOrders).toFixed(2),
      revenueChange: Number(revenueChange.toFixed(1)),
      ordersChange: Number(ordersChange.toFixed(1)),
      aovChange: Number(aovChange.toFixed(1)),
    },
    revenueTimeSeries,
    topProducts,
  }
}
