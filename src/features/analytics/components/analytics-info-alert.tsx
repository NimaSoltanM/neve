import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { useI18n } from '@/features/shared/i18n'

interface AnalyticsInfoAlertProps {
  isDemo: boolean
}

export function AnalyticsInfoAlert({ isDemo }: AnalyticsInfoAlertProps) {
  const { t, dir } = useI18n()

  return (
    <Alert
      dir={dir}
      className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950"
    >
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertTitle className="text-blue-900 dark:text-blue-100">
        {t(isDemo ? 'analytics.demoModeTitle' : 'analytics.realModeTitle')}
      </AlertTitle>
      <AlertDescription className="text-blue-800 dark:text-blue-200 space-y-2">
        <p>
          {t(
            isDemo
              ? 'analytics.demoModeDescription'
              : 'analytics.realModeDescription',
          )}
        </p>
        {isDemo && (
          <ul className="list-disc space-y-1 text-sm mt-2 ms-4">
            <li>{t('analytics.demoModeFeature1')}</li>
            <li>{t('analytics.demoModeFeature2')}</li>
            <li>{t('analytics.demoModeFeature3')}</li>
          </ul>
        )}
      </AlertDescription>
    </Alert>
  )
}
