import { Link, useLocation } from '@tanstack/react-router'
import { useI18n } from '@/features/shared/i18n'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface SidebarNavItem {
  title: string
  href?: string
  icon?: LucideIcon
  badge?: string | number
  children?: SidebarNavItem[]
  external?: boolean
  hide?: boolean
  isloading?: boolean
}

interface AppSidebarProps {
  items: {
    title: string
    items: SidebarNavItem[]
  }[]
  footer?: React.ReactNode
}

export function AppSidebar({ items, footer }: AppSidebarProps) {
  const location = useLocation()
  const { t, dir } = useI18n()

  const isActive = (href?: string) => {
    if (!href) return false
    return (
      location.pathname === href || location.pathname.startsWith(href + '/')
    )
  }

  return (
    <Sidebar collapsible="icon" side={dir === 'rtl' ? 'right' : 'left'}>
      {/* ===== Header ===== */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/marketplace" search={{ search: '', page: 1 }}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-lg font-semibold">M</span>
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">{t('common.siteName')}</span>
                  <span className="text-xs text-muted-foreground">
                    {t('common.siteTagline')}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ===== Content ===== */}
      <SidebarContent>
        {items.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  if (item.hide) return null // 🔹 Skip hidden items

                  const Icon = item.icon
                  const active = isActive(item.href)

                  // ---- Loading state (skeleton) ----
                  if (item.isloading) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton disabled>
                          <div className="flex items-center gap-2 w-full">
                            <Skeleton className="h-4 w-4 rounded" />
                            <Skeleton className="h-4 flex-1 rounded" />
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }

                  // ---- Collapsible with children ----
                  if (item.children?.length) {
                    const visibleChildren = item.children.filter(
                      (child) => !child.hide,
                    )

                    if (!visibleChildren.length) return null // 🔹 Skip parent if all children hidden

                    return (
                      <Collapsible key={item.title} defaultOpen={active}>
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                              {Icon && <Icon className="h-4 w-4" />}
                              <span>{item.title}</span>
                              <ChevronRight className="ms-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {visibleChildren.map((child) => (
                                <SidebarMenuSubItem key={child.title}>
                                  {child.isloading ? (
                                    <SidebarMenuSubButton>
                                      <div className="flex items-center gap-2 w-full">
                                        <Skeleton className="h-3 w-3 rounded" />
                                        <Skeleton className="h-3 flex-1 rounded" />
                                      </div>
                                    </SidebarMenuSubButton>
                                  ) : (
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={isActive(child.href)}
                                    >
                                      <Link to={child.href || '#'}>
                                        {child.title}
                                      </Link>
                                    </SidebarMenuSubButton>
                                  )}
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    )
                  }

                  // ---- Regular link ----
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={active}>
                        <Link to={item.href || '#'}>
                          {Icon && <Icon className="h-4 w-4" />}
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className="ms-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* ===== Footer ===== */}
      {footer && <SidebarFooter>{footer}</SidebarFooter>}
    </Sidebar>
  )
}
