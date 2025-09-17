import { useState, useEffect } from 'react'
import { useI18n } from '@/features/shared/i18n'

export function useCountdown(targetDate: Date | null | undefined) {
  const { t } = useI18n()
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    if (!targetDate) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const difference = target - now

      if (difference <= 0) {
        setTimeLeft(t('marketplace.auctionEnded'))
        clearInterval(timer)
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      )
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`)
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}m`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, t])

  return timeLeft
}
