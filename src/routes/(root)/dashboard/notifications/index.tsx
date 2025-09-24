import { createFileRoute } from '@tanstack/react-router'
import { NotificationPage } from '@/features/notifications/components/notification-page'

export const Route = createFileRoute('/(root)/dashboard/notifications/')({
  component: NotificationPage,
})
