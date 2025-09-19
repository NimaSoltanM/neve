// src/routes/(root)/(marketplace).tsx
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/(root)/(marketplace)')({
  component: MarketplaceLayout,
})

function MarketplaceLayout() {
  return (
    <div className="container py-6">
      <Outlet />
    </div>
  )
}
