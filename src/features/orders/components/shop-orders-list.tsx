import { useState } from 'react'
import { useShopOrders } from '../hooks/use-shop-orders'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ShopOrderStatusBadge } from './shop-order-status-badge'
import { ShopOrderStatusSelect } from './shop-order-status-select'
import { Package, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useI18n } from '@/features/shared/i18n'

type OrderStatus = 'pending' | 'paid' | 'completed' | 'cancelled'

function OrdersTableSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-9 w-32" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export function ShopOrdersList() {
  const { t, locale } = useI18n()
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(
    undefined,
  )

  const { data, isLoading } = useShopOrders({
    page,
    limit: 20,
    status: statusFilter,
  })

  const formatLocalizedPrice = (price: string | number) => {
    return formatPrice(price, { locale: locale as 'en' | 'fa' })
  }

  const orders = data?.orders || []
  const pagination = data?.pagination || {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('shop.orders')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('shopOrders.manageDescription')}
          </p>
        </div>

        <Select
          value={statusFilter || 'all'}
          onValueChange={(value) => {
            setStatusFilter(
              value === 'all' ? undefined : (value as OrderStatus),
            )
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 me-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('shopOrders.allOrders')}</SelectItem>
            <SelectItem value="pending">{t('shopOrders.pending')}</SelectItem>
            <SelectItem value="paid">{t('shopOrders.paid')}</SelectItem>
            <SelectItem value="completed">
              {t('shopOrders.completed')}
            </SelectItem>
            <SelectItem value="cancelled">
              {t('shopOrders.cancelled')}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <OrdersTableSkeleton />
      ) : orders.length === 0 ? (
        /* Empty State */
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t('shopOrders.noOrders')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {statusFilter
                  ? t('shopOrders.noOrdersWithFilter')
                  : t('shopOrders.noOrdersYet')}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Orders Table */
        <>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold ps-6">
                      {t('shopOrders.orderId')}
                    </TableHead>
                    <TableHead className="font-semibold">
                      {t('shopOrders.customer')}
                    </TableHead>
                    <TableHead className="font-semibold">
                      {t('shopOrders.items')}
                    </TableHead>
                    <TableHead className="font-semibold">
                      {t('shopOrders.total')}
                    </TableHead>
                    <TableHead className="font-semibold">
                      {t('shopOrders.status')}
                    </TableHead>
                    <TableHead className="font-semibold">
                      {t('shopOrders.date')}
                    </TableHead>
                    <TableHead className="font-semibold text-center pe-6">
                      {t('shopOrders.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-mono font-medium ps-6">
                        #{order.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="font-medium text-sm">
                            {order.user?.firstName} {order.user?.lastName}
                          </div>

                          {order.user?.phoneNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {order.items.length}{' '}
                          {order.items.length === 1
                            ? t('shopOrders.item')
                            : t('shopOrders.itemsPlural')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {formatLocalizedPrice(order.totalAmount)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ShopOrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString(
                          locale === 'fa' ? 'fa-IR' : 'en-US',
                          {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          },
                        )}
                      </TableCell>
                      <TableCell className="pe-6">
                        <div className="flex justify-center">
                          <ShopOrderStatusSelect
                            orderId={order.id}
                            currentStatus={order.status}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
              <div className="text-sm text-muted-foreground">
                {t('shopOrders.pageInfo', {
                  page: pagination.page,
                  totalPages: pagination.totalPages,
                  total: pagination.total,
                })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 ltr:me-1 rtl:ms-1 rtl:rotate-180" />
                  {t('common.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                >
                  {t('common.next')}
                  <ChevronRight className="h-4 w-4 ltr:ms-1 rtl:me-1 rtl:rotate-180" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
