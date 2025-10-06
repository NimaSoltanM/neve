import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(dashboards)/shop/orders/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(dashboards)/shop/orders/"!</div>
}
