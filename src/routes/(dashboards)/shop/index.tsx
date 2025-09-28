import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(dashboards)/shop/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(root)/(marketplace)/shop/"!</div>
}
