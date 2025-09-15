import { useI18n } from './context'
import { useCallback } from 'react'

export function useFormatters() {
  const { locale } = useI18n()

  const formatCurrency = useCallback(
    (amount: number) => {
      if (locale === 'fa') {
        return new Intl.NumberFormat('fa-IR', {
          style: 'currency',
          currency: 'IRR',
          maximumFractionDigits: 0,
        }).format(amount)
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)
    },
    [locale],
  )

  const formatNumber = useCallback(
    (num: number) => {
      return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US').format(
        num,
      )
    },
    [locale],
  )

  const formatDate = useCallback(
    (date: Date) => {
      return new Intl.DateTimeFormat(
        locale === 'fa' ? 'fa-IR' : 'en-US',
      ).format(date)
    },
    [locale],
  )

  return { formatCurrency, formatNumber, formatDate }
}
