import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(dashboards)/shop/analytics/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(dashboards)/shop/analytics/"!</div>
}
