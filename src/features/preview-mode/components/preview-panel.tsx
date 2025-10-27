import { X, CheckCircle, Circle } from 'lucide-react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useI18n } from '@/features/shared/i18n'
import { cn } from '@/lib/utils'
import { PREVIEW_FEATURES } from '../types'
import {
  isPreviewOpenAtom,
  exploredFeaturesAtom,
  markExploredAtom,
} from '../atoms'

export function PreviewPanel() {
  const { t, dir, locale, setLocale } = useI18n()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useAtom(isPreviewOpenAtom)
  const explored = useAtomValue(exploredFeaturesAtom)
  const markExplored = useSetAtom(markExploredAtom)

  if (!isOpen) return null

  const handleAction = async (feature: (typeof PREVIEW_FEATURES)[0]) => {
    markExplored(feature.id)

    switch (feature.action.type) {
      case 'navigate':
        if (feature.action.to) {
          navigate({ to: feature.action.to })
          setTimeout(() => setIsOpen(false), 500)
        }
        break

      case 'toggle-lang':
        setLocale(locale === 'en' ? 'fa' : 'en')
        break
    }
  }

  const progress = Math.round((explored.length / PREVIEW_FEATURES.length) * 100)

  return (
    <div
      dir={dir}
      className={cn(
        'fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-sm border-t shadow-lg z-50',
        'animate-in slide-in-from-bottom duration-300',
        'max-h-[60vh] sm:max-h-[45vh] overflow-y-auto',
      )}
    >
      <div className="p-3 sm:p-4">
        {/* Compact header for mobile */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-semibold truncate">
              {t('preview.title')}
            </h3>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {t('preview.subtitle')}
            </p>

            {/* Mobile progress */}
            <div className="flex items-center gap-2 mt-1 sm:hidden">
              <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
          </div>

          {/* Desktop progress */}
          <div className="hidden sm:flex items-center gap-2 me-4">
            <span className="text-sm font-medium">{progress}%</span>
            <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile: Horizontal scroll / Desktop: Grid */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 overflow-x-auto sm:overflow-visible pb-1 -mx-3 px-3 sm:mx-0 sm:px-0">
          {PREVIEW_FEATURES.map((feature) => {
            const isExplored = explored.includes(feature.id)

            return (
              <Card
                key={feature.id}
                className={cn(
                  'shrink-0 w-[200px] sm:w-auto p-2 sm:p-3 cursor-pointer transition-all',
                  'hover:shadow-md hover:border-primary/50',
                  isExplored && 'border-muted opacity-80',
                )}
                onClick={() => handleAction(feature)}
              >
                {/* Mobile: Compact layout */}
                <div className="space-y-1.5 sm:space-y-2">
                  {/* Icon row */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg sm:text-2xl">{feature.icon}</span>
                    {isExplored ? (
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    ) : (
                      <Circle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Text content */}
                  <div>
                    <h4 className="font-medium text-xs sm:text-sm line-clamp-1">
                      {t(feature.titleKey as any)}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {t(feature.descKey as any)}
                    </p>
                  </div>

                  {/* Badges - only show on desktop or if important */}
                  {feature.badge === 'try-this' && !isExplored && (
                    <Badge variant="default" className="text-xs h-5 sm:h-6">
                      {t('preview.tryIt')}
                    </Badge>
                  )}

                  {/* Tech badges - hide on mobile */}
                  {feature.tech && (
                    <div className="hidden sm:flex flex-wrap gap-1">
                      {feature.tech.map((tech) => (
                        <Badge
                          key={tech}
                          variant="outline"
                          className="text-xs h-5"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
