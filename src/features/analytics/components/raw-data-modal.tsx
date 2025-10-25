import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Code } from 'lucide-react'
import { useI18n } from '@/features/shared/i18n'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { AnalyticsDashboardData } from '../types/analytics.types'

interface RawDataModalProps {
  data: AnalyticsDashboardData
}

export function RawDataModal({ data }: RawDataModalProps) {
  const { t } = useI18n()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Code className="h-4 w-4 me-2" />
          {t('analytics.viewRawData')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t('analytics.viewRawData')}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full rounded-md border">
          <pre className="p-4 text-xs">
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
