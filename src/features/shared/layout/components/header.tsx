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
import {
  Store,
  Package,
  LogOut,
  LayoutDashboard,
  Gavel,
  Menu,
} from 'lucide-react'
import { CartButton } from '@/features/cart/components/cart-button'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { Skeleton } from '@/components/ui/skeleton'
import { LogoIcon } from '@/components/logo-icon'
import { Logo } from '@/components/logo'
import { ModeToggle } from '../../theme'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function Header() {
  const { t, dir } = useI18n()
  const { user, isAuthenticated, logout, isLoading } = useAuth()

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      dir={dir}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left Section: Logo + Navigation */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg shrink-0"
          >
            <LogoIcon className="h-8 w-8 sm:hidden" />
            <Logo className="hidden sm:block h-8" />
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/marketplace" search={{ page: 1 }}>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    {t('nav.marketplace')}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t('nav.menu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side={dir === 'rtl' ? 'right' : 'left'}>
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  to="/marketplace"
                  search={{ page: 1 }}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  {t('nav.marketplace')}
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {t('nav.dashboard')}
                    </Link>
                    <Link
                      to="/dashboard/orders"
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {t('nav.orders')}
                    </Link>
                    <Link
                      to="/dashboard/bids"
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {t('nav.bids')}
                    </Link>
                    <Link
                      to="/shop"
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {t('nav.myShop')}
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Shopping Actions */}
          {isLoading ? (
            <Skeleton className="h-9 w-9 rounded-md" />
          ) : (
            <CartButton />
          )}

          {/* User Section - Only show if authenticated */}
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="" alt={user?.firstName || ''} />
                      <AvatarFallback className="text-xs">
                        {user?.firstName?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={user?.firstName || ''} />
                        <AvatarFallback>
                          {user?.firstName?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p
                          className="text-xs leading-none text-muted-foreground mt-1"
                          dir="ltr"
                        >
                          {user?.phoneNumber}
                        </p>
                      </div>
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
                    <LogOut className="me-2 h-4 w-4" />
                    {t('auth.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : null}

          {/* Settings Group - with visual separator */}
          <div className="flex items-center gap-1 ms-1 ps-3 border-s">
            <LanguageSwitcher />
            <ModeToggle />
          </div>

          {/* Login Button - only show if not authenticated */}
          {!isLoading && !isAuthenticated && (
            <Button asChild size="sm" className="ms-1">
              <Link to="/auth">{t('nav.login')}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
