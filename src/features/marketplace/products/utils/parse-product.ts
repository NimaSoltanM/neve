import type { ProductType } from '../types'

/**
 * Parses a product from the database, converting string dates to Date objects
 * and ensuring all fields are properly typed
 */
export function parseProduct(product: ProductType): ProductType {
  return {
    ...product,
    // Convert timestamp fields from string to Date if needed
    auctionEndsAt: product.auctionEndsAt
      ? product.auctionEndsAt instanceof Date
        ? product.auctionEndsAt
        : new Date(product.auctionEndsAt)
      : null,
    createdAt:
      product.createdAt instanceof Date
        ? product.createdAt
        : new Date(product.createdAt),
    endedAt: product.endedAt
      ? product.endedAt instanceof Date
        ? product.endedAt
        : new Date(product.endedAt)
      : null,
    paymentDeadline: product.paymentDeadline
      ? product.paymentDeadline instanceof Date
        ? product.paymentDeadline
        : new Date(product.paymentDeadline)
      : null,
  }
}
