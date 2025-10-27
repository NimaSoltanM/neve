import { Sparkles } from 'lucide-react'
import { useAtom, useAtomValue } from 'jotai'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/features/shared/i18n'
import { cn } from '@/lib/utils'
import { isPreviewOpenAtom, exploredFeaturesAtom } from '../atoms'
import { PREVIEW_FEATURES } from '../types'

export function PreviewTrigger() {
  const { dir } = useI18n()
  const [isOpen, setIsOpen] = useAtom(isPreviewOpenAtom)
  const explored = useAtomValue(exploredFeaturesAtom)

  if (isOpen) return null

  const hasExplored = explored.length > 0
  const remaining = PREVIEW_FEATURES.length - explored.length

  return (
    <div
      dir={dir}
      className={cn('fixed bottom-4 z-40', 'ltr:right-4 rtl:left-4')}
    >
      {/* Mobile: Just icon / Desktop: Icon with text */}
      <Button
        onClick={() => setIsOpen(true)}
        size="default"
        variant={hasExplored ? 'default' : 'outline'}
        className={cn('shadow-lg relative', hasExplored && 'animate-pulse')}
      >
        <Sparkles className="h-4 w-4 sm:me-2" />
        <span className="hidden sm:inline">
          {hasExplored ? `${remaining} features left` : 'Explore Features'}
        </span>

        {/* Badge for mobile */}
        {hasExplored && remaining > 0 && (
          <span className="sm:hidden absolute -top-2 -end-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
            {remaining}
          </span>
        )}
      </Button>
    </div>
  )
}
