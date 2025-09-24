import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  getRecentNotifications,
  getUnreadCount,
} from '../actions/get-notifications.action'
import { NotificationDropdownItem } from './notification-dropdown-item'
import { useI18n } from '@/features/shared/i18n'
import { BellOff, ArrowRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

function NotificationListSkeleton() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <div className="divide-y">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 p-4">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

export function NotificationList() {
  const { t, dir } = useI18n()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () => getRecentNotifications(),
  })

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => getUnreadCount(),
  })

  if (isLoading) {
    return <NotificationListSkeleton />
  }

  return (
    <div className="w-full" dir={dir}>
      {/* Header */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{t('notifications.title')}</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 px-1.5">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      {notifications.length === 0 ? (
        <div className="p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <BellOff className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-sm font-medium">
              {t('notifications.emptyTitle')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('notifications.empty')}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="divide-y">
            {notifications.map((notification) => (
              <NotificationDropdownItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>

          <Link
            to="/dashboard/notifications"
            className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-primary border-t hover:bg-accent transition-colors"
          >
            {t('notifications.viewAll')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </>
      )}
    </div>
  )
}
