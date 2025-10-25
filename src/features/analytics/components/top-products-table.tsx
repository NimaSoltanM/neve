import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Package } from 'lucide-react'
import type { TopProduct } from '../types/analytics.types'
import { useI18n } from '@/features/shared/i18n'
import { formatPrice } from '@/lib/utils'

interface TopProductsTableProps {
  products: TopProduct[]
  title: string
}

export function TopProductsTable({ products, title }: TopProductsTableProps) {
  const { t, dir, locale } = useI18n()

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {t('analytics.noProducts')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>{t('analytics.product')}</TableHead>
                <TableHead className="text-end">
                  {t('analytics.revenue')}
                </TableHead>
                <TableHead className="text-end hidden md:table-cell">
                  {t('analytics.unitsSold')}
                </TableHead>
                <TableHead className="text-end hidden lg:table-cell">
                  {t('analytics.orders')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, index) => (
                <TableRow key={product.productId}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    {/* <Link
                      to="/products/$slug"
                      params={{ slug: product.productSlug }}
                      className="flex items-center gap-3 hover:underline"
                    
                    > */}
                    <div className="flex items-center gap-3 hover:underline">
                      <div className="h-10 w-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        {product.productImage ? (
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="line-clamp-2 flex-1">
                      {product.productName}
                    </span>
                    {/* </Link> */}
                  </TableCell>
                  <TableCell className="text-end font-medium">
                    {formatPrice(product.totalRevenue, { locale })}
                  </TableCell>
                  <TableCell className="text-end hidden md:table-cell">
                    {product.unitsSold}
                  </TableCell>
                  <TableCell className="text-end hidden lg:table-cell">
                    {product.orderCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
