import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Outlet,
} from '@tanstack/react-router'
import { useEffect } from 'react'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/sonner'
import { useI18n } from '@/features/shared/i18n/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Home } from 'lucide-react'
import { ThemeProvider } from '@/features/shared/theme'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'névé | E-Commerce Platform',
      },
      {
        name: 'meta',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster richColors />
          {/* <TanstackDevtools
          config={{
            position: 'bottom-left',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        /> */}
        </ThemeProvider>

        <Scripts />
      </body>
    </html>
  )
}

function RootComponent() {
  const { locale, dir } = useI18n()

  useEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dir
  }, [locale, dir])

  return <Outlet />
}

function NotFoundComponent() {
  const { t, dir } = useI18n()

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background p-4"
      dir={dir}
    >
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            {t('notFoundErrors.notFound')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t('notFoundErrors.notFoundDescription')}
          </p>
          <Button asChild className="w-full">
            <a href="/">
              <Home className="h-4 w-4 me-2" />
              {t('common.goHome')}
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
