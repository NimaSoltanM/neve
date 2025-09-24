import { useNotifications } from '../hooks/use-notifications'
import { NotificationItem } from './notification-item'
import { useI18n } from '@/features/shared/i18n'
import { Button } from '@/components/ui/button'
import { Bell, Trash2, Check, Archive, BellOff } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useState } from 'react'

function NotificationSkeleton() {
  return (
    <div className="flex gap-4 px-6 py-5 border-b">
      <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="w-2 h-2 rounded-full flex-shrink-0" />
    </div>
  )
}

export function NotificationPage() {
  const { t, dir } = useI18n()
  const { notifications, isLoading, markAllAsRead, clearAll } =
    useNotifications()

  const [activeTab, setActiveTab] = useState('all')

  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const readNotifications = notifications.filter((n) => n.isRead)

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return unreadNotifications
      case 'read':
        return readNotifications
      default:
        return notifications
    }
  }

  const filteredNotifications = getFilteredNotifications()

  const notificationsByType = {
    bids: notifications.filter((n) => n.type.startsWith('bid')),
    orders: notifications.filter((n) => n.type.startsWith('order')),
    system: notifications.filter((n) => n.type === 'system'),
  }

  return (
    <div className="min-h-screen bg-muted/30 py-6 sm:py-8 lg:py-12" dir={dir}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Card */}
        <div className="bg-background rounded-xl border shadow-sm mb-6 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                    {t('notifications.title')}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1">
                    {unreadNotifications.length > 0
                      ? t('notifications.unreadCount').replace(
                          '{count}',
                          unreadNotifications.length.toString(),
                        )
                      : t('notifications.emptyTitle')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {unreadNotifications.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => markAllAsRead()}
                    className="gap-2"
                  >
                    <Check className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t('notifications.markAllRead')}
                    </span>
                    <span className="sm:hidden">
                      {t('notifications.markAllRead').split(' ')[0]}
                    </span>
                  </Button>
                )}
                {notifications.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => clearAll()}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {t('notifications.clearAll')}
                    </span>
                    <span className="sm:hidden">
                      {t('notifications.clearAll').split(' ')[0]}
                    </span>
                  </Button>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            {notifications.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-primary">
                    {unreadNotifications.length}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {t('notifications.unread')}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl sm:text-3xl font-bold">
                    {notificationsByType.bids.length}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {t('notifications.bids')}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl sm:text-3xl font-bold">
                    {notificationsByType.orders.length}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {t('notifications.orders')}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl sm:text-3xl font-bold">
                    {notifications.length}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    {t('notifications.total')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Card */}
        {isLoading ? (
          <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-background rounded-xl border shadow-sm">
            <div className="px-6 py-20 sm:p-24">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                  <BellOff className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-3">
                  {t('notifications.emptyTitle')}
                </h3>
                <p className="text-muted-foreground max-w-md text-sm sm:text-base">
                  {t('notifications.emptyDescription')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b px-6 py-4">
                <TabsList className="w-full sm:w-auto bg-muted/50">
                  <TabsTrigger
                    value="all"
                    className="gap-2 data-[state=active]:bg-background"
                  >
                    <span>{t('notifications.all')}</span>
                    <Badge variant="secondary" className="h-5 px-1.5">
                      {notifications.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="gap-2 data-[state=active]:bg-background"
                  >
                    <span>{t('notifications.unread')}</span>
                    {unreadNotifications.length > 0 && (
                      <Badge variant="destructive" className="h-5 px-1.5">
                        {unreadNotifications.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="read"
                    className="gap-2 data-[state=active]:bg-background"
                  >
                    <span>{t('notifications.read')}</span>
                    <Badge variant="secondary" className="h-5 px-1.5">
                      {readNotifications.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="m-0">
                {filteredNotifications.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <Archive className="h-14 w-14 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm sm:text-base">
                      {activeTab === 'unread'
                        ? t('notifications.noUnread')
                        : activeTab === 'read'
                          ? t('notifications.noRead')
                          : t('notifications.noNotifications')}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y max-h-[600px] overflow-y-auto">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
