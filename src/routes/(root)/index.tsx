// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useNavigate } from '@tanstack/react-router'
import {
  ArrowRight,
  ShoppingCart,
  Gavel,
  Store,
  CreditCard,
  Shield,
  Globe,
} from 'lucide-react'
import { useI18n, LanguageSwitcher } from '@/features/shared/i18n'

export const Route = createFileRoute('/(root)/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const { t, dir, locale } = useI18n()

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      {/* Language Switcher */}
      <div className="absolute top-4 end-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              {t('landing.badge')}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
              {t('landing.title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-pretty leading-relaxed mb-8">
              {t('landing.subtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button
              size="lg"
              className="group"
              onClick={() =>
                navigate({ to: '/marketplace', search: { page: 1 } })
              }
            >
              {t('landing.exploreButton')}
              <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 rtl:group-hover:translate-x-0" />
            </Button>
            <a
              href="https://github.com/NimaSoltanM/neve"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg">
                {t('landing.sourceCodeButton')}
              </Button>
            </a>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {locale === 'fa' ? '۳' : '3'}
              </div>
              <div>{t('landing.stats.features')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {t('landing.stats.fullStackValue')}
              </div>
              <div>{t('landing.stats.fullStack')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {t('landing.stats.techStackValue')}
              </div>
              <div>{t('landing.stats.techStack')}</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {t('landing.stats.designValue')}
              </div>
              <div>{t('landing.stats.design')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('landing.featuresTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              {t('landing.featuresSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Multi-Vendor Card */}
            <Card className="group hover:bg-accent/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t('landing.multiVendor.title')}</CardTitle>
                <CardDescription>
                  {t('landing.multiVendor.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    <span>{t('landing.multiVendor.point1')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    <span>{t('landing.multiVendor.point2')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    <span>{t('landing.multiVendor.point3')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Flow Card */}
            <Card className="group hover:bg-accent/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t('landing.orderFlow.title')}</CardTitle>
                <CardDescription>
                  {t('landing.orderFlow.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    <span>{t('landing.orderFlow.point1')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    <span>{t('landing.orderFlow.point2')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    <span>{t('landing.orderFlow.point3')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Auction Card */}
            <Card className="group hover:bg-accent/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Gavel className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t('landing.auction.title')}</CardTitle>
                <CardDescription>
                  {t('landing.auction.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    <span>{t('landing.auction.point1')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    <span>{t('landing.auction.point2')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                    <span>{t('landing.auction.point3')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Implementation */}
      <section className="px-6 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('landing.technicalTitle')}
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              {t('landing.technicalSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Frontend */}
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  {t('landing.frontend.title')}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t('landing.frontend.item1')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t('landing.frontend.item2')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t('landing.frontend.item3')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t('landing.frontend.item4')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Backend */}
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  {t('landing.backend.title')}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t('landing.backend.item1')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t('landing.backend.item2')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t('landing.backend.item3')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t('landing.backend.item4')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Key Features */}
              <div>
                <h3 className="text-xl font-semibold mb-3">
                  {t('landing.keyFeatures.title')}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t('landing.keyFeatures.item1')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t('landing.keyFeatures.item2')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">
                      {t('landing.keyFeatures.item3')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowRight className="h-4 w-4 text-primary flex-shrink-0 rtl:rotate-180" />
                    <span className="text-muted-foreground">
                      {t('landing.keyFeatures.item4')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Why This Project Box */}
              <div className="p-6 bg-card rounded-lg border">
                <h4 className="font-semibold mb-2">
                  {t('landing.whyProject.title')}
                </h4>
                <p className="text-sm text-muted-foreground text-pretty">
                  {t('landing.whyProject.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('landing.ctaTitle')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            {t('landing.ctaSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group"
              onClick={() =>
                navigate({ to: '/marketplace', search: { page: 1 } })
              }
            >
              {t('landing.tryPlatformButton')}
              <ArrowRight className="ms-2 h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 rtl:group-hover:translate-x-0" />
            </Button>
            <a
              href="https://github.com/NimaSoltanM/neve"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="lg">
                {t('landing.githubButton')}
              </Button>
            </a>
            <Button variant="outline" size="lg" asChild>
              <a href="https://t.me/NimaSoltanM" target="_blank">
                {t('landing.contactButton')}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
