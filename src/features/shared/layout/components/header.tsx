// src/features/shared/layout/components/header.tsx
import { Link } from '@tanstack/react-router'
import { useI18n } from '@/features/shared/i18n'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/features/shared/i18n'
import { useAuth } from '@/features/auth/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Store, Package, LogOut, LayoutDashboard, Gavel } from 'lucide-react'
import { CartButton } from '@/features/cart/components/cart-button'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { Skeleton } from '@/components/ui/skeleton'
import { LogoIcon } from '@/components/logo-icon'
import { Logo } from '@/components/logo'
import { ModeToggle } from '../../theme'

export function Header() {
  const { t, dir } = useI18n()
  const { user, isAuthenticated, logout, isLoading } = useAuth()

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      dir={dir}
    >
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg me-6">
          <LogoIcon className="h-8 w-8 sm:hidden" />
          <Logo className="hidden sm:block h-8" />
        </Link>

        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/marketplace" search={{ page: 1 }}>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  {t('nav.marketplace')}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/categories">
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  {t('nav.categories')}
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ms-auto flex items-center gap-2">
          {/* Cart */}
          {isLoading ? (
            <Skeleton className="h-9 w-9 rounded-md" />
          ) : (
            <CartButton />
          )}

          {/* Notifications */}
          {isLoading ? (
            <Skeleton className="h-9 w-9 rounded-md" />
          ) : (
            isAuthenticated && <NotificationBell />
          )}

          {/* Language always available */}
          <LanguageSwitcher />

          <ModeToggle />

          {/* User Menu */}
          {isLoading ? (
            <Skeleton className="h-9 w-9 rounded-full" />
          ) : isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt={user?.firstName || ''} />
                    <AvatarFallback>
                      {user?.firstName?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {user?.phoneNumber}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="me-2 h-4 w-4" />
                    {t('nav.dashboard')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/orders" className="cursor-pointer">
                    <Package className="me-2 h-4 w-4" />
                    {t('nav.orders')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/bids" className="cursor-pointer">
                    <Gavel className="me-2 h-4 w-4" />
                    {t('nav.bids')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/shop" className="cursor-pointer">
                    <Store className="me-2 h-4 w-4" />
                    {t('nav.myShop')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={() => logout()}
                >
                  <LogOut className="me-2 h-4 w-4 text-destructive" />
                  {t('auth.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">{t('nav.login')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
