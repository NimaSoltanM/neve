import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '@/features/auth/actions/get-current-user.action'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { LanguageSwitcher, useI18n } from '@/features/shared/i18n'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, LogOut, User } from 'lucide-react'

export const Route = createFileRoute('/dashboard/')({
  beforeLoad: async () => {
    const { isAuthenticated, needsProfile } = await getCurrentUser()

    if (!isAuthenticated || needsProfile) {
      throw redirect({
        to: '/auth',
        search: {
          callbackUrl: '/dashboard',
        },
      })
    }
  },
  component: DashboardComponent,
})

function DashboardComponent() {
  const { t, dir } = useI18n()
  const { user, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <LanguageSwitcher />
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">{t('auth.welcomeBack')}</h1>
          <Button variant="outline" onClick={() => logout()} className="gap-2">
            <LogOut className="h-4 w-4" />
            {t('auth.logout')}
          </Button>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <p className="font-medium" dir="ltr">
                {user?.phoneNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {user?.createdAt &&
                  new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
