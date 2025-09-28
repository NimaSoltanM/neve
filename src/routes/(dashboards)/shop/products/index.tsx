import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(dashboards)/shop/products/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(dashboards)/shop/products/"!</div>
}
