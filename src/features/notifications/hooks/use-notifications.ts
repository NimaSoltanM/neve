import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getUserNotifications,
  getUnreadCount,
} from '../actions/get-notifications.action'
import { markAsRead, markAllAsRead } from '../actions/mark-read.action'
import {
  deleteNotifications,
  clearAllNotifications,
} from '../actions/delete-notification.action'

export function useNotifications() {
  const queryClient = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => getUserNotifications(),
    refetchInterval: 60000,
  })

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => getUnreadCount(),
    refetchInterval: 30000,
  })

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
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

  const clearAllMutation = useMutation({
    mutationFn: clearAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: (notificationIds: number[]) =>
      markReadMutation.mutate({ data: { notificationIds } }),
    markAllAsRead: () => markAllReadMutation.mutate({ data: undefined }),
    deleteNotifications: (notificationIds: number[]) =>
      deleteMutation.mutate({ data: { notificationIds } }),
    clearAll: () => clearAllMutation.mutate({ data: undefined }),
  }
}
