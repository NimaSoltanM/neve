import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useI18n } from '@/features/shared/i18n'

type AnalyticsPeriod = '7d' | '30d' | '90d' | '1y'

interface PeriodSelectorProps {
  value: AnalyticsPeriod
  onChange: (period: AnalyticsPeriod) => void
}

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const { t, dir } = useI18n()

  const periods: { value: AnalyticsPeriod; label: string }[] = [
    { value: '7d', label: t('analytics.period7d') },
    { value: '30d', label: t('analytics.period30d') },
    { value: '90d', label: t('analytics.period90d') },
    { value: '1y', label: t('analytics.period1y') },
  ]

  return (
    <div dir={dir} className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {t('analytics.selectPeriod')}:
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {periods.map((period) => (
            <SelectItem key={period.value} value={period.value}>
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
