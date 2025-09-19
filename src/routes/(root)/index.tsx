import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello homepage</div>
}
