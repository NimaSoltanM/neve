import { Link } from '@tanstack/react-router'
import { useI18n } from '@/features/shared/i18n'
import { Home, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FloatingDock() {
  const { t } = useI18n()

  const links = [
    {
      to: '/',
      icon: Home,
      label: t('nav.home'),
    },
    {
      to: '/marketplace',
      icon: Store,
      label: t('nav.marketplace'),
      search: { page: 1 },
    },
  ]

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden bg-transparent">
      <nav className="flex items-center gap-1 px-3 py-2 rounded-full border border-border/40 bg-background/80 backdrop-blur-xl shadow-2xl">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            search={link.search}
            className="group relative flex items-center justify-center"
            activeProps={{
              className: 'text-primary',
            }}
            inactiveProps={{
              className: 'text-muted-foreground',
            }}
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200',
                    'hover:bg-accent active:scale-95',
                    isActive && 'bg-primary/10',
                  )}
                >
                  <link.icon className="h-5 w-5" />
                </div>

                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 text-xs font-medium bg-popover text-popover-foreground rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {link.label}
                </span>
              </>
            )}
          </Link>
        ))}
      </nav>
    </div>
  )
}
