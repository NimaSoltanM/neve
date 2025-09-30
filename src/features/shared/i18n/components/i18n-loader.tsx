import { useI18n } from '../context'

export function I18nLoader({ children }: { children: React.ReactNode }) {
  const { isLoading } = useI18n()

  return <>{children}</>
}
