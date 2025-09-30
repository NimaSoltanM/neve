import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser } from '../actions/get-current-user.action'
import { logout } from '../actions/logout.action'
import { toast } from 'sonner'
import { useI18n } from '@/features/shared/i18n'

export function useAuth() {
  const queryClient = useQueryClient()
  const { t } = useI18n()

  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
  })

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'currentUser'], {
        user: null,
        isAuthenticated: false,
      })
      toast.success(t('common.success'))
      window.location.reload()
    },
  })

  return {
    user: data?.user || null,
    isAuthenticated: data?.isAuthenticated || false,
    needsProfile: data?.needsProfile || false,
    isLoading,
    logout: () => logoutMutation.mutate({}),
  }
}
