import { createFileRoute, Link } from '@tanstack/react-router'
import { getUserProducts } from '@/features/marketplace/products/actions/product-management.actions'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Eye, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { deleteProduct } from '@/features/marketplace/products/actions/product-management.actions'
import { toast } from 'sonner'
import { useRouter } from '@tanstack/react-router'
import { useI18n } from '@/features/shared/i18n/hooks'

export const Route = createFileRoute('/(dashboards)/shop/products/')({
  loader: async () => {
    const result = await getUserProducts()
    return result
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t, locale } = useI18n()
  const dir = locale === 'fa' ? 'rtl' : 'ltr'
  const loaderData = Route.useLoaderData()
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<number | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (productId: number) => deleteProduct({ data: productId }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(t('shops.productDeleted'))
        setDeleteDialogOpen(false)
        setProductToDelete(null)
        router.invalidate()
      } else {
        toast.error(result.error || t('common.error'))
      }
    },
    onError: () => {
      toast.error(t('common.error'))
    },
  })

  const handleDeleteClick = (productId: number) => {
    setProductToDelete(productId)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteMutation.mutate(productToDelete)
    }
  }

  const products = loaderData.success ? loaderData.data : []

  return (
    <div dir={dir} className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {t('shops.allProducts')}
              </CardTitle>
              <CardDescription>{t('shops.productsSubtitle')}</CardDescription>
            </div>
            <Link to="/shop/products/new">
              <Button>
                <Plus className="w-4 h-4 me-2" />
                {t('shops.addNewProduct')}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-2">
                {t('shops.noProducts')}
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                {t('shops.noProductsDesc')}
              </p>
              <Link to="/shop/products/new">
                <Button>
                  <Plus className="w-4 h-4 me-2" />
                  {t('shops.addNewProduct')}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.image')}</TableHead>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead>{t('shops.type')}</TableHead>
                    <TableHead>{t('shops.category')}</TableHead>
                    <TableHead>{t('common.price')}</TableHead>
                    <TableHead>{t('common.stock')}</TableHead>
                    <TableHead className="text-end">
                      {t('common.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.type === 'auction' ? 'default' : 'secondary'
                          }
                        >
                          {product.type === 'auction'
                            ? t('shops.auctionProduct')
                            : t('shops.regularProduct')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.category.name[locale as 'en' | 'fa'] ||
                          product.category.name.en}
                      </TableCell>
                      <TableCell>
                        {product.type === 'regular'
                          ? `$${product.price}`
                          : `$${product.startingPrice}`}
                      </TableCell>
                      <TableCell>
                        {product.type === 'regular'
                          ? product.stock
                          : t('marketplace.auction')}
                      </TableCell>
                      <TableCell className="text-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                to="/products/$productSlug"
                                params={{ productSlug: product.slug }}
                              >
                                <Eye className="w-4 h-4 me-2" />
                                {t('shops.viewProduct')}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                to="/shop/products/$productId/edit"
                                params={{
                                  productId: product.id.toString(),
                                }}
                              >
                                <Pencil className="w-4 h-4 me-2" />
                                {t('shops.editProduct')}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteClick(product.id)}
                            >
                              <Trash2 className="w-4 h-4 me-2" />
                              {t('shops.deleteProduct')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('shops.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('shops.confirmDeleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending
                ? t('common.loading')
                : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
