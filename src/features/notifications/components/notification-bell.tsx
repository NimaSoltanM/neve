import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotifications } from '../hooks/use-notifications'
import { NotificationList } from './notification-list'
import { Badge } from '@/components/ui/badge'

export function NotificationBell() {
  const { unreadCount } = useNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -end-1 h-5 w-5 p-0 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      {/* Set dropdown width once and let children adapt */}
      <DropdownMenuContent
        className="min-w-[440px] max-w-md p-0 bg-background/60 backdrop-blur-lg border border-border/50 shadow-xl rounded-xl"
        align="end"
      >
        <NotificationList />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
