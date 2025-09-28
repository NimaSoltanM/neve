import { Link } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { markAsRead } from '../actions/mark-read.action'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationDropdownItemProps {
  notification: {
    id: number
    type: string
    title: string
    message: string
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

export function NotificationDropdownItem({
  notification,
}: NotificationDropdownItemProps) {
  const { locale } = useI18n()
  const queryClient = useQueryClient()

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const handleClick = () => {
    if (!notification.isRead) {
      markReadMutation.mutate({ data: { notificationIds: [notification.id] } })
    }
  }

  const Icon = typeIcons[notification.type] || Bell

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: locale === 'fa' ? faIR : enUS,
  })

  const content = (
    <div
      className={cn(
        'flex gap-3 p-4 hover:bg-accent cursor-pointer transition-colors',
        !notification.isRead && 'bg-primary/5',
      )}
      onClick={handleClick}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
          notification.priority === 'urgent'
            ? 'bg-destructive text-destructive-foreground'
            : notification.priority === 'high'
              ? 'bg-orange-500 text-white'
              : 'bg-primary/10 text-primary',
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-medium text-sm',
            !notification.isRead && 'font-semibold',
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-2">{timeAgo}</p>
      </div>

      {!notification.isRead && (
        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
      )}
    </div>
  )

  if (notification.actionUrl) {
    return (
      <Link to="/dashboard/notifications" className="block">
        {content}
      </Link>
    )
  }

  return content
}
