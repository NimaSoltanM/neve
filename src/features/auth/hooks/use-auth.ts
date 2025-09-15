import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser } from '../actions/get-current-user.action'
import { logout } from '../actions/logout.action'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useI18n } from '@/features/shared/i18n'

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { t } = useI18n()

  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'currentUser'], {
        user: null,
        isAuthenticated: false,
      })
      router.navigate({ to: '/auth' })
      toast.success(t('common.success'))
    },
  })

  return {
    user: data?.user || null,
    isAuthenticated: data?.isAuthenticated || false,
    needsProfile: data?.needsProfile || false,
    isLoading,
    logout: () => logoutMutation.mutate({}), // Wrap it to not require args
  }
}
