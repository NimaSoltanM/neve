import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '../middleware/auth.middleware'

export const getMe = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return {
      user: context.user,
    }
  })
