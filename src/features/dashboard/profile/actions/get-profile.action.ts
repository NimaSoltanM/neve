import { createServerFn } from '@tanstack/react-start'
import { getCurrentUser } from '@/features/auth/actions/get-current-user.action'

export const getProfile = createServerFn({ method: 'GET' }).handler(
  async () => {
    const { isAuthenticated, user } = await getCurrentUser()

    if (!isAuthenticated || !user) {
      throw new Error('Unauthorized')
    }

    return {
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar || null,
        createdAt: user.createdAt,
      },
    }
  },
)
