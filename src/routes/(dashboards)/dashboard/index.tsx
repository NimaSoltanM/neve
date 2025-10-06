import { createFileRoute } from '@tanstack/react-router'
import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview'

export const Route = createFileRoute('/(dashboards)/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container mx-auto p-6">
      <DashboardOverview />
    </div>
  )
}
