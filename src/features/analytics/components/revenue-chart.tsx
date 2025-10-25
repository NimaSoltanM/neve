import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { RevenueDataPoint } from '../types/analytics.types'
import { useI18n } from '@/features/shared/i18n'
import { formatPrice } from '@/lib/utils'

interface RevenueChartProps {
  data: RevenueDataPoint[]
  title: string
}

export function RevenueChart({ data, title }: RevenueChartProps) {
  const { locale } = useI18n()

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
    }).format(date)
  }

  const formatYAxis = (value: number) => {
    if (locale === 'fa') {
      // For Persian, show in thousands of Toman
      const tomanValue = value * 100000
      return `${(tomanValue / 1000).toFixed(0)}هزار`
    }
    return `$${value}`
  }

  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: '#3b82f6',
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <LineChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatDate}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatYAxis}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={formatDate}
                  formatter={(value, name) => {
                    if (name === 'revenue') {
                      return formatPrice(value as string, { locale })
                    }
                    return value
                  }}
                />
              }
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
