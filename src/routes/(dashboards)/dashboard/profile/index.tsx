import ProfilePage from '@/features/dashboard/profile/components/profile-page'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(dashboards)/dashboard/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProfilePage />
}
