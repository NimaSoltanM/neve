import { useI18n } from '@/features/shared/i18n/hooks'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      // Remove Persian/Arabic characters and replace with empty string
      .replace(
        /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g,
        '',
      )
      // Replace spaces and multiple hyphens with single hyphen
      .replace(/[\s_]+/g, '-')
      // Remove all non-alphanumeric characters except hyphens
      .replace(/[^a-z0-9-]/g, '')
      // Remove multiple consecutive hyphens
      .replace(/-+/g, '-')
      // Remove leading and trailing hyphens
      .replace(/^-+|-+$/g, '') ||
    // If empty after cleaning, generate random string
    `product-${Date.now()}`
  )
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
    return options?.locale === 'fa' ? '۰ تومان' : '$0.00'
  }

  const {
    currency = 'USD',
    locale = 'en-US',
    notation = 'standard',
  } = options || {}

  // Persian/Iranian Toman handling
  if (locale === 'fa') {
    const tomanPrice = numericPrice * 100000
    const formatted = new Intl.NumberFormat('fa-IR', {
      notation,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(tomanPrice)

    return `${formatted} تومان`
  }

  // Other locales use standard currency formatting
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice)
}

export function useFormatPrice() {
  const { locale } = useI18n()

  return (price: string | number, currency = 'USD') => {
    return formatPrice(price, { locale, currency })
  }
}
