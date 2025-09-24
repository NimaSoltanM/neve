import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotifications } from '../hooks/use-notifications'
import { NotificationList } from './notification-list'

export function NotificationBell() {
  const { unreadCount } = useNotifications()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
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
