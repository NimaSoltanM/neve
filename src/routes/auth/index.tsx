import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthContainer } from '@/features/auth/components/auth-container'
import { getCurrentUser } from '@/features/auth/actions/get-current-user.action'
import { z } from 'zod'

const searchSchema = z.object({
  callbackUrl: z.string().optional(),
})

export const Route = createFileRoute('/auth/')({
  validateSearch: searchSchema,
  beforeLoad: async ({ search }) => {
    const { user, isAuthenticated, needsProfile } = await getCurrentUser()

    if (isAuthenticated && !needsProfile) {
      throw redirect({
        to: search.callbackUrl || '/dashboard',
      })
    }

    return { user, needsProfile }
  },
  component: AuthPage,
})

function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <AuthContainer />
    </div>
  )
}
