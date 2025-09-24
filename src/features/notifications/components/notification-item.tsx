import { Link } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markAsRead } from '../actions/mark-read.action'
import { deleteNotifications } from '../actions/delete-notification.action'
import { useI18n } from '@/features/shared/i18n'
import { formatDistanceToNow } from 'date-fns'
import { faIR, enUS } from 'date-fns/locale'
import {
  Package,
  Gavel,
  ShoppingCart,
  Bell,
  TrendingUp,
  Clock,
  X,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface NotificationItemProps {
  notification: {
    id: number
    type: string
    title: string
    message: string
    icon?: string | null
    actionUrl?: string | null
    isRead: boolean
    priority: string
    createdAt: Date
    metadata?: Record<string, any> | null
  }
}

const typeIcons: Record<string, React.ComponentType<any>> = {
  'bid.placed': Gavel,
  'bid.outbid': TrendingUp,
  'bid.won': Gavel,
  'order.placed': ShoppingCart,
  'order.shipped': Package,
  'order.delivered': Package,
  'auction.ending': Clock,
  'price.drop': TrendingUp,
  system: Bell,
}

const priorityConfig: Record<string, { color: string; badge: string }> = {
  urgent: { color: 'text-destructive', badge: 'destructive' },
  high: { color: 'text-orange-500', badge: 'orange' },
  normal: { color: '', badge: 'secondary' },
  low: { color: 'text-muted-foreground', badge: 'outline' },
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { locale, dir, t } = useI18n()
  const queryClient = useQueryClient()

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const handleClick = () => {
    if (!notification.isRead) {
      markReadMutation.mutate({ data: { notificationIds: [notification.id] } })
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    deleteMutation.mutate({ data: { notificationIds: [notification.id] } })
  }

  const Icon = typeIcons[notification.type] || Bell
  const config = priorityConfig[notification.priority] || priorityConfig.normal

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: locale === 'fa' ? faIR : enUS,
  })

  const content = (
    <div
      className={cn(
        'group relative flex gap-4 px-6 py-5 transition-all cursor-pointer',
        'hover:bg-accent/50',
        !notification.isRead && 'bg-primary/5 hover:bg-primary/10',
      )}
      onClick={handleClick}
    >
      {/* Unread indicator bar */}
      {!notification.isRead && (
        <div className="absolute inset-y-0 start-0 w-1 bg-primary" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors',
          notification.isRead
            ? 'bg-muted'
            : 'bg-primary/10 group-hover:bg-primary/20',
        )}
      >
        <Icon
          className={cn('h-6 w-6', !notification.isRead && 'text-primary')}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={cn(
                  'text-sm leading-relaxed',
                  !notification.isRead && 'font-semibold',
                  config.color,
                )}
              >
                {notification.title}
              </p>
              {notification.priority !== 'normal' && (
                <Badge
                  variant={config.badge as any}
                  className="h-5 px-2 text-xs font-medium"
                >
                  {t(`notifications.priority.${notification.priority}`)}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ms-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {notification.actionUrl && (
              <ChevronRight className="h-5 w-5 text-muted-foreground rtl:rotate-180" />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDelete}
              title={t('notifications.delete')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  if (notification.actionUrl) {
    return (
      <Link to={notification.actionUrl} className="block">
        {content}
      </Link>
    )
  }

  return content
}
