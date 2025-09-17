import { useI18n } from '@/features/shared/i18n/hooks'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  price: string | number,
  options?: {
    currency?: string
    locale?: string
    notation?: Intl.NumberFormatOptions['notation']
  },
) {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price

  if (isNaN(numericPrice)) {
    return '$0.00'
  }

  const {
    currency = 'USD',
    locale = 'en-US',
    notation = 'standard',
  } = options || {}

  // For Persian locale, use Persian numerals
  const formatLocale = locale === 'fa' ? 'fa-IR' : locale

  return new Intl.NumberFormat(formatLocale, {
    style: 'currency',
    currency,
    notation,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice)
}

// Optional: Add a hook for easier use with i18n
export function useFormatPrice() {
  const { locale } = useI18n()

  return (price: string | number, currency = 'USD') => {
    return formatPrice(price, { locale, currency })
  }
}
