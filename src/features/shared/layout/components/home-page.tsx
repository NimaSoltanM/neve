import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useRouter } from '@tanstack/react-router'
import {
  ArrowRight,
  ShoppingCart,
  Gavel,
  Store,
  Users,
  CreditCard,
  Shield,
} from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      <section className="px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              Resume Project
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
              E-Commerce Platform
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-pretty leading-relaxed mb-8">
              {
                "Hey there! 👋 This isn't your typical landing page. I'm showcasing a full-stack e-commerce platform I built to demonstrate my technical skills. Feel free to explore the features below and see what I can build."
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button
              size="lg"
              className="group"
              onClick={() =>
                router.navigate({ to: '/marketplace', search: { page: 1 } })
              }
            >
              Explore the Platform
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <a href="https://github.com/NimaSoltanM/neve" target="_blank">
              <Button variant="outline" size="lg">
                View Source Code
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
            <div>
              <div className="text-2xl font-bold text-foreground">3</div>
              <div>Core Features</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">100%</div>
              <div>Full-Stack</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">Modern</div>
              <div>Tech Stack</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                Responsive
              </div>
              <div>Design</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What I Built
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              {
                'A comprehensive e-commerce solution showcasing modern web development practices and user experience design.'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="group hover:bg-accent/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Multi-Vendor Shops</CardTitle>
                <CardDescription>
                  Users can create their own shops, customize storefronts, and
                  manage their product catalog with an intuitive dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Shop customization
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Product management
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Analytics dashboard
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:bg-accent/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Complete Order Flow</CardTitle>
                <CardDescription>
                  Full shopping cart functionality with secure checkout, payment
                  processing, and order tracking for seamless transactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Shopping cart
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Secure payments
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Order tracking
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:bg-accent/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Gavel className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Live Auction System</CardTitle>
                <CardDescription>
                  Real-time bidding platform where users can list items for
                  auction and participate in competitive bidding with live
                  updates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Real-time bidding
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Auction management
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    Bid notifications
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
              Technical Implementation
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              {
                'Built with modern technologies and best practices to showcase full-stack development capabilities.'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Frontend</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-muted-foreground">
                      Next.js 14 with App Router
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-muted-foreground">
                      TypeScript for type safety
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-muted-foreground">
                      Tailwind CSS for styling
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-muted-foreground">
                      Responsive design patterns
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">
                  Backend & Database
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-muted-foreground">
                      Server Actions & API Routes
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-muted-foreground">
                      Database integration
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-muted-foreground">
                      Authentication & authorization
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span className="text-muted-foreground">
                      Real-time updates
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3">Key Features</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      User management system
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      Payment processing
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      Security best practices
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">
                      SEO optimization
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-card rounded-lg border">
                <h4 className="font-semibold mb-2">{'Why This Project?'}</h4>
                <p className="text-sm text-muted-foreground text-pretty">
                  {
                    'This project demonstrates my ability to build complex, real-world applications with multiple user flows, data relationships, and modern web technologies.'
                  }
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
            {'Ready to See More?'}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            {
              'Explore the live platform, check out the code, or get in touch to discuss how I can contribute to your team.'
            }
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="group"
              onClick={() =>
                router.navigate({ to: '/marketplace', search: { page: 1 } })
              }
            >
              Try the Platform
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <a href="https://github.com/NimaSoltanM/neve" target="_blank">
              <Button variant="outline" size="lg">
                View on GitHub
              </Button>
            </a>
            <Button variant="outline" size="lg">
              Contact Me
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
